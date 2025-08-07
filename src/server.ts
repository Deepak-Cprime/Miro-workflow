import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { MiroWorkflowAnalyzerApp } from './index.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

let analyzerApp: MiroWorkflowAnalyzerApp | null = null;

app.post('/api/analyze', async (req: Request, res: Response) => {
  try {
    const { projectId, boardId, outputDir } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    if (!boardId) {
      return res.status(400).json({ error: 'Board ID is required' });
    }

    console.log(`🚀 Starting workflow analysis for project ${projectId}, board ${boardId}`);

    analyzerApp = new MiroWorkflowAnalyzerApp(projectId);
    await analyzerApp.analyzeBoardWorkflow(boardId, outputDir);

    res.json({ 
      success: true, 
      message: 'Workflow analysis completed successfully',
      projectId,
      boardId
    });

  } catch (error) {
    console.error('❌ API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

app.get('/api/boards', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    analyzerApp = new MiroWorkflowAnalyzerApp(projectId as string);
    const boards = await analyzerApp.listBoards();

    res.json({ success: true, boards });

  } catch (error) {
    console.error('❌ API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`🚀 Miro Workflow Analyzer API server running on port ${port}`);
  console.log(`📡 Health check: http://localhost:${port}/health`);
  console.log(`📊 Analyze endpoint: POST http://localhost:${port}/api/analyze`);
  console.log(`📋 List boards endpoint: GET http://localhost:${port}/api/boards?projectId=<id>`);
});