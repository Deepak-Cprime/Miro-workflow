# 🔍 Miro Workflow Analyzer

AI-powered workflow analysis tool that extracts detailed workflow information from Miro boards using Google Gemini API.

## ✨ Features

- **Complete Board Analysis**: Extract all items, connections, groups, and tags from Miro boards
- **AI-Powered Insights**: Use Google Gemini to analyze workflow patterns and generate intelligent recommendations
- **Comprehensive Reporting**: Generate detailed markdown reports with process flows, critical paths, and optimization suggestions
- **Business Value Assessment**: Understand the business impact and value of your workflows
- **Issue Detection**: Automatically identify potential bottlenecks and process inefficiencies

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Miro Developer Account with API access
- Google AI Studio account with Gemini API access

### Installation

1. **Clone and setup**:
```bash
cd miro-workflow-analyzer
npm install
```

2. **Configure environment**:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
MIRO_ACCESS_TOKEN=your_miro_access_token_here
GEMINI_API_KEY=your_gemini_api_key_here
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

#### Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Create a new project or use existing one
3. Generate an API key
4. Copy the key to your `.env` file

## 📋 Usage

### List Available Boards
```bash
npm run analyze list
```

### Analyze a Specific Board
```bash
npm run analyze <board-id>
```

### Analyze with Custom Output Directory
```bash
npm run analyze <board-id> ./custom-reports
```

### Show Help
```bash
npm run analyze help
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
- **Process Steps**: Detailed step-by-step breakdown
- **Process Flow**: Narrative description of the workflow
- **Critical Path**: Main process sequence identification
- **Issue Detection**: Bottlenecks, disconnected nodes, inefficiencies
- **Optimization Suggestions**: Actionable improvement recommendations
- **Business Value Assessment**: Impact and value analysis
- **Resource Requirements**: Estimated resources needed

## 📁 Output Files

For each analysis, the tool generates:

1. **Raw Data JSON** (`workflow-data-TIMESTAMP.json`)
   - Complete extracted board data
   - Gemini AI analysis results
   - Structured data for further processing

2. **Analysis Report** (`workflow-report-TIMESTAMP.md`)
   - Executive summary
   - Detailed process documentation
   - Issues and recommendations
   - Business impact assessment

## 🛠️ Development

### Project Structure
```
src/
├── index.ts                 # Main application entry point
├── types/
│   └── miro.ts             # TypeScript interfaces
├── services/
│   ├── miroClient.ts       # Miro API wrapper
│   ├── workflowAnalyzer.ts # Workflow extraction logic
│   └── geminiAnalyzer.ts   # AI analysis integration
└── utils/                  # Utility functions
```

### Available Scripts
```bash
npm run build    # Compile TypeScript
npm run start    # Run compiled application
npm run dev      # Run with tsx for development
npm run analyze  # Alias for npm run dev
```

### Adding New Analysis Features

1. **Extract additional data** in `WorkflowAnalyzer`
2. **Enhance AI prompts** in `GeminiAnalyzer`
3. **Update type definitions** in `types/miro.ts`
4. **Extend report generation** in `generateWorkflowReport`

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
MIRO_ACCESS_TOKEN=required     # Miro API access token
GEMINI_API_KEY=required        # Google Gemini API key
OUTPUT_DIR=optional            # Custom output directory (default: ./output)
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