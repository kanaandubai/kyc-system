import { Response, RequestHandler } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../types';
import { uploadConfig } from '../config/upload.config';
import fs from 'fs/promises';
import path from 'path';
const getFullDocumentUrl = (req: AuthRequest, documentId: number) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/api/kyc/document/${documentId}`;
};

export const submitKYC: RequestHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  const file = req.file;
  try {
    const { fullName } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      if (file) await fs.unlink(file.path).catch(console.error);
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    if (!fullName?.trim()) {
      if (file) await fs.unlink(file.path).catch(console.error);
      res.status(400).json({ message: 'Full name is required' });
      return;
    }

    if (!file) {
      res.status(400).json({ message: 'Document file is required' });
      return;
    }

    const kyc = await prisma.kYC.create({
      data: {
        fullName: fullName.trim(),
        documentUrl: file.filename,
        userId,
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            email: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'KYC submitted successfully',
      kyc: {
        ...kyc,
        documentUrl: getFullDocumentUrl(req, kyc.id)
      }
    });
  } catch (error) {
    if (file) await fs.unlink(file.path).catch(console.error);
    console.error('KYC submission error:', error);
    res.status(500).json({ message: 'Error submitting KYC' });
  }
};
export const getKYCStatus: RequestHandler = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const kyc = await prisma.kYC.findUnique({
      where: { userId: req.user.id },
      include: {
        user: {
          select: {
            email: true
          }
        }
      }
    });

    // Transform response with full URL
    const transformedKyc = kyc ? {
      ...kyc,
      documentUrl: getFullDocumentUrl(req, kyc.id)
    } : null;

    return res.json({ kyc: transformedKyc });
  } catch (error) {
    console.error('Error fetching KYC status:', error);
    res.status(500).json({ message: 'Error fetching KYC status' });
  }
};

export const getAllKYCs: RequestHandler = async (req: AuthRequest, res: Response) => {
  try {
    const kycs = await prisma.kYC.findMany({
      include: {
        user: {
          select: {
            email: true,
            role: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform all KYCs with full URLs
    const transformedKycs = kycs.map(kyc => ({
      ...kyc,
      documentUrl: getFullDocumentUrl(req, kyc.id)
    }));

    res.json({ kycs: transformedKycs });
  } catch (error) {
    console.error('Error fetching KYCs:', error);
    res.status(500).json({ message: 'Error fetching KYCs' });
  }
};

export const updateKYCStatus: RequestHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const updatedKYC = await prisma.kYC.update({
      where: { id: parseInt(id) },
      data: {
        status,
        adminNotes: adminNotes?.trim(),
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            email: true
          }
        }
      }
    });

    res.json({
      message: `KYC ${status.toLowerCase()} successfully`,
      kyc: {
        ...updatedKYC,
        documentUrl: getFullDocumentUrl(req, updatedKYC.id)
      }
    });
  } catch (error) {
    console.error('Error updating KYC status:', error);
    res.status(500).json({ message: 'Error updating KYC status' });
  }
};

// Get KYC Statistics
export const getKYCStatistics: RequestHandler = async (req: AuthRequest, res: Response) => {
  try {
    const [totalUsers, totalKYCs, statusCounts, recentSubmissions] = await Promise.all([
      prisma.user.count(),
      prisma.kYC.count(),
      prisma.kYC.groupBy({
        by: ['status'],
        _count: true
      }),
      prisma.kYC.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          user: {
            select: {
              email: true
            }
          }
        }
      })
    ]);

    const formattedRecentSubmissions = recentSubmissions.map(kyc => ({
      ...kyc,
      documentUrl: `/api/kyc/document/${kyc.id}`
    }));

    const statistics = {
      totalUsers,
      totalKYCs,
      kycStats: {
        PENDING: 0,
        APPROVED: 0,
        REJECTED: 0,
        ...Object.fromEntries(
          statusCounts.map(({ status, _count }) => [status, _count])
        )
      },
      recentSubmissions: formattedRecentSubmissions,
      verificationRate: totalKYCs > 0 
        ? ((statusCounts.find(s => s.status === 'APPROVED')?._count || 0) / totalKYCs * 100).toFixed(2)
        : 0
    };

    res.json(statistics);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
};
export const getDocument: RequestHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    console.log('Requested document ID:', id);

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const kyc = await prisma.kYC.findUnique({
      where: { id: parseInt(id) },
      select: {
        documentUrl: true,
        userId: true,
        user: {
          select: { role: true }
        }
      }
    });

    console.log('Found KYC record:', kyc);

    if (!kyc || !kyc.documentUrl) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check authorization
    if (kyc.userId !== userId && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Updated path resolution
    const filePath = path.join(process.cwd(), '../uploads', kyc.documentUrl);
    console.log('Attempting to access file at:', filePath);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      console.error('File access error:', error);
      return res.status(404).json({ message: 'Document file not found' });
    }

    // Set content type
    const ext = path.extname(kyc.documentUrl).toLowerCase();
    const contentType = ext === '.pdf' ? 'application/pdf' : 
                       ext === '.png' ? 'image/png' : 'image/jpeg';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename=${path.basename(kyc.documentUrl)}`);
    res.sendFile(filePath);

  } catch (error) {
    console.error('Error in getDocument:', error);
    res.status(500).json({ message: 'Error fetching document' });
  }
};

// Search KYCs
export const searchKYCs: RequestHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { status, email, date } = req.query;
    
    const filters: any = {};

    if (status) {
      filters.status = status;
    }

    if (email) {
      filters.user = {
        email: {
          contains: email as string
        }
      };
    }

    if (date) {
      filters.createdAt = {
        gte: new Date(date as string)
      };
    }

    const kycs = await prisma.kYC.findMany({
      where: filters,
      include: {
        user: {
          select: {
            email: true,
            role: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedKycs = kycs.map(kyc => ({
      ...kyc,
      documentUrl: `/api/kyc/document/${kyc.id}`
    }));

    res.json({ kycs: formattedKycs });
  } catch (error) {
    console.error('Error searching KYCs:', error);
    res.status(500).json({ message: 'Error searching KYCs' });
  }
};

// Delete KYC
export const deleteKYC: RequestHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const kyc = await prisma.kYC.findUnique({
      where: { id: parseInt(id) },
      select: { documentUrl: true }
    });

    if (kyc?.documentUrl) {
      const filePath = uploadConfig.getDocumentPath(kyc.documentUrl);
      await fs.unlink(filePath).catch(console.error);
    }

    await prisma.kYC.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'KYC deleted successfully' });
  } catch (error) {
    console.error('Error deleting KYC:', error);
    res.status(500).json({ message: 'Error deleting KYC' });
  }
};