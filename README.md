# 🔍 Miro Workflow Analyzer

AI-powered workflow analysis tool that extracts detailed workflow information from Miro boards using OpenAI GPT-4 and automatically creates work items in TargetProcess.

## ✨ Features

- **Complete Board Analysis**: Extract all items, connections, groups, and tags from Miro boards
- **AI-Powered Insights**: Use OpenAI GPT-4 to analyze workflow patterns and generate intelligent recommendations
- **TargetProcess Integration**: Automatically create epics, features, and user stories in TargetProcess
- **Comprehensive Reporting**: Generate detailed markdown reports with process flows, critical paths, and optimization suggestions
- **Business Value Assessment**: Understand the business impact and value of your workflows
- **Issue Detection**: Automatically identify potential bottlenecks and process inefficiencies
- **API Server Mode**: Run as a web service for integration with other applications
- **Cloud Deployment Ready**: Deploy to Render, Heroku, or other cloud platforms

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Miro Developer Account with API access
- OpenAI API account with GPT-4 access
- TargetProcess account with API access (for work item creation)

### Installation

1. **Clone and setup**:
```bash
cd miro-workflow-analyzer
npm install
```

2. **Configure environment**:
Create a `.env` file in the root directory:

```env
# Miro API Configuration
MIRO_ACCESS_TOKEN=your_miro_access_token_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# TargetProcess Configuration
TARGET_API_BASE_URL=https://your-company.tpondemand.com
TARGET_API_ACCESS_TOKEN=your_targetprocess_api_token

# Optional: Default Project ID (can be overridden in commands)
PROJECT_ID=your_default_project_id

# Optional: Server Configuration
PORT=3000
NODE_ENV=development
```

3. **Build the application**:
```bash
npm run build
```

### Getting API Keys

#### Miro Access Token
1. Go to [Miro Developers](https://developers.miro.com/)
2. Create a new app or use existing one
3. Generate an access token with board read permissions
4. Copy the token to your `.env` file

#### OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Generate a new API key
5. Copy the key to your `.env` file

#### TargetProcess API Configuration
1. Log into your TargetProcess instance
2. Go to Settings → (Your Profile) → Access Tokens
3. Create a new access token with appropriate permissions
4. Note your TargetProcess base URL (e.g., `https://company.tpondemand.com`)
5. Add both to your `.env` file

## 📋 Usage

The application can be run in two modes: **CLI Mode** (standalone) or **API Server Mode** (for integrations).

### CLI Mode (Standalone)

#### Analyze with Project ID
```bash
npm run analyze <project-id> [board-id] [output-dir]
```

**Examples:**
```bash
# Use default board ID for project 286882
npm run analyze 286882

# Specify custom board ID and project ID
npm run analyze 286882 uXjVJXqJT1w= ./my-reports

# List available boards for a project
npm run analyze list 286882

# Show help
npm run analyze help
```

### API Server Mode

#### Start the API Server
```bash
npm run server
```

The server will start on `http://localhost:3000` with the following endpoints:

- **POST** `/api/analyze` - Analyze workflow and create TargetProcess work items
- **GET** `/api/boards?projectId=<id>` - List available Miro boards
- **GET** `/health` - Health check endpoint

#### API Usage Example
```javascript
const response = await fetch('http://localhost:3000/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectId: "286882",
    boardId: "uXjVJXqJT1w=",
    outputDir: "./reports" // optional
  })
});
```

## 📊 What Gets Analyzed

### Board Elements
- **Items**: Sticky notes, cards, shapes, text, images, frames, documents, embeds
- **Connections**: All connectors between items with labels
- **Groups**: Item groupings and hierarchies
- **Tags**: All tags and their associations
- **Metadata**: Creation dates, authors, positions, styling

### AI Analysis Includes
- **Workflow Summary**: High-level process overview
- **Epic & Feature Generation**: Automatically create epics and features
- **User Story Creation**: Generate detailed user stories with acceptance criteria
- **Process Steps**: Detailed step-by-step breakdown
- **Process Flow**: Narrative description of the workflow
- **Critical Path**: Main process sequence identification
- **Issue Detection**: Bottlenecks, disconnected nodes, inefficiencies
- **Risk Assessment**: Identify potential risks and mitigation strategies
- **Optimization Suggestions**: Actionable improvement recommendations
- **Business Value Assessment**: Impact and value analysis
- **Time to Market Estimation**: Estimated development timeline

## 📁 Output Files & TargetProcess Integration

For each analysis, the tool generates:

1. **Raw Data JSON** (`workflow-data-TIMESTAMP.json`)
   - Complete extracted board data
   - OpenAI GPT-4 analysis results
   - Work item creation results
   - Structured data for further processing

2. **Analysis Report** (`workflow-report-TIMESTAMP.md`)
   - Executive summary
   - Detailed process documentation
   - Issues and recommendations
   - Business impact assessment

3. **Work Items JSON** (`work-items-TIMESTAMP.json`)
   - Created epic, feature, and user story details
   - TargetProcess work item IDs
   - Creation success/failure status

### TargetProcess Work Items Created

The application automatically creates the following work items in TargetProcess:

- **📋 Epic**: High-level project epic with business value description
- **⚡ Features**: Multiple features broken down from the workflow analysis
- **📝 User Stories**: Detailed user stories with acceptance criteria for each feature
- **⚠️ Risks**: Risk assessment items linked to appropriate features

All work items are automatically linked and organized in a proper hierarchy within your specified TargetProcess project.

## 🛠️ Development

### Project Structure
```
src/
├── index.ts                 # Main CLI application entry point
├── server.ts               # API server for integrations
├── types/
│   └── miro.ts             # TypeScript interfaces
├── services/
│   ├── miroClient.ts       # Miro API wrapper
│   ├── workflowAnalyzer.ts # Workflow extraction logic
│   ├── openaiAnalyzer.ts   # AI analysis integration (OpenAI GPT-4)
│   └── workItemCreator.ts  # TargetProcess work item creation
└── utils/                  # Utility functions
```

### Available Scripts
```bash
npm run build        # Compile TypeScript
npm run start        # Run compiled CLI application
npm run dev          # Run CLI with tsx for development
npm run analyze      # Alias for npm run dev
npm run server       # Start API server for development
npm run start:server # Start compiled API server for production
```

### Adding New Analysis Features

1. **Extract additional data** in `WorkflowAnalyzer`
2. **Enhance AI prompts** in `OpenAIAnalyzer`
3. **Update type definitions** in `types/miro.ts`
4. **Extend work item creation** in `WorkItemCreator`
5. **Extend report generation** in `generateWorkflowReport`

## 📈 Use Cases

- **Process Documentation**: Automatically document complex business processes
- **Workflow Optimization**: Identify bottlenecks and improvement opportunities
- **Compliance Analysis**: Ensure processes meet regulatory requirements
- **Team Onboarding**: Generate clear process documentation for new team members
- **Process Standardization**: Analyze variations across similar workflows
- **Change Impact Assessment**: Understand workflow dependencies before changes

## 🔧 Configuration

### Environment Variables
```env
# Required
MIRO_ACCESS_TOKEN=required           # Miro API access token
OPENAI_API_KEY=required             # OpenAI API key
TARGET_API_BASE_URL=required        # TargetProcess base URL
TARGET_API_ACCESS_TOKEN=required    # TargetProcess API token

# Optional
PROJECT_ID=optional                 # Default project ID
PORT=optional                       # Server port (default: 3000)
NODE_ENV=optional                   # Environment mode
OUTPUT_DIR=optional                 # Custom output directory (default: ./output)
```

### Miro API Permissions Required
- `boards:read` - Read board information
- `boards:read_items` - Read board items and connections

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

ISC License

## 🆘 Troubleshooting

### Common Issues

**"No boards found"**
- Verify your Miro access token has correct permissions
- Ensure the token is for the right Miro account

**"Gemini API error"**
- Check your Gemini API key is valid
- Verify you have sufficient API quota

**"Board not found"**
- Ensure the board ID is correct
- Verify you have access to the specific board

**"Connection timeout"**
- Check your internet connection
- Verify API endpoints are accessible

### Debug Mode
Set `NODE_ENV=development` for detailed logging.

## 🔮 Future Enhancements

- Support for multiple board analysis
- Integration with other diagramming tools
- Advanced workflow metrics and KPIs  
- Export to BPMN format
- Real-time workflow monitoring
- Integration with project management tools