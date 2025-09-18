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
    const { boardId, outputDir, workflowName, projectId } = req.body;

    if (!boardId) {
      return res.status(400).json({ error: 'Board ID is required' });
    }

    console.log(`🚀 Starting workflow analysis for board ${boardId}, project ${projectId}`);

    // Send immediate response to avoid timeout
    res.json({
      success: true,
      message: 'Workflow analysis started successfully',
      projectId: projectId || 'unknown',
      boardId,
      status: 'processing'
    });

    // Process analysis in background after response is sent
    setImmediate(async () => {
      try {
        if (!analyzerApp) {
          analyzerApp = new MiroWorkflowAnalyzerApp();
        }
        const result = await analyzerApp.analyzeBoardWorkflow(boardId, outputDir, workflowName, projectId);
        console.log(`✅ Analysis completed for board ${boardId}, project ${projectId || 'unknown'}`);
      } catch (error) {
        console.error(`❌ Background analysis failed for board ${boardId}:`, error);
      }
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
    analyzerApp = new MiroWorkflowAnalyzerApp();
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

// Keep-alive mechanism to prevent sleeping
const KEEP_ALIVE_INTERVAL = 14 * 60 * 1000; // 14 minutes
let keepAliveTimer: NodeJS.Timeout;

function keepAlive() {
  console.log('🔄 Keep-alive ping to prevent sleeping');
  // Self-ping to stay awake
  if (process.env.NODE_ENV === 'production') {
    fetch(`https://miro-workflow-analyzer.onrender.com/health`)
      .then(() => console.log('✅ Keep-alive successful'))
      .catch(err => console.log('⚠️ Keep-alive failed:', err.message));
  }
}

app.listen(port, () => {
  console.log(`🚀 Miro Workflow Analyzer API server running on port ${port}`);
  console.log(`📡 Health check: http://localhost:${port}/health`);
  console.log(`📊 Analyze endpoint: POST http://localhost:${port}/api/analyze`);
  console.log(`📋 List boards endpoint: GET http://localhost:${port}/api/boards`);
  
  // Start keep-alive timer in production
  if (process.env.NODE_ENV === 'production') {
    keepAliveTimer = setInterval(keepAlive, KEEP_ALIVE_INTERVAL);
    console.log('🔄 Keep-alive service started (14 min intervals)');
  }
});