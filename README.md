# Backlog MCP Server

![MIT License](https://img.shields.io/badge/license-MIT-green.svg)
![Build](https://github.com/nulab/backlog-mcp-server/actions/workflows/ci.yml/badge.svg)
![Last Commit](https://img.shields.io/github/last-commit/nulab/backlog-mcp-server.svg)

[📘 日本語でのご利用ガイド](./README.ja.md) 

A Model Context Protocol (MCP) server for interacting with the Backlog API. This server provides tools for managing projects, issues, wiki pages, and more in Backlog through AI agents like Claude Desktop / Cline / Cursor etc.

## Features

- Project management (create, read, update, delete)
- Issue tracking (create, update, delete, list)
- Wiki page management
- Git repository management
- Pull request management (create, update, list, comment)
- Notification management
- Watching list management
- GraphQL-style field selection for optimized responses
- Token limiting for large responses
- Enhanced error handling
- And more Backlog API integrations

## Requirements

- Docker
- A Backlog account with API access
- API key from your Backlog account

## Installation

### Option 1: Install via Docker

The easiest way to use this MCP server is through MCP configuration for Claude Desktop or Cline:

1. Open Claude Desktop or Cline settings
2. Navigate to the MCP configuration section
3. Add the following configuration:

```json
{
  "mcpServers": {
    "backlog": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e", "BACKLOG_DOMAIN",
        "-e", "BACKLOG_API_KEY",
        "ghcr.io/nulab/backlog-mcp-server"
      ],
      "env": {
        "BACKLOG_DOMAIN": "your-domain.backlog.com",
        "BACKLOG_API_KEY": "your-api-key"
      }
    }
  }
}
```

Replace `your-domain.backlog.com` with your Backlog domain and `your-api-key` with your Backlog API key.

#### Advanced Configuration Options

This is an experimental approach, and not the standard way to reduce the size of the context window.
If you're having trouble using this MCP with any AI agents, please try adjusting the following settings.
You can add additional options to customize the server behavior:

```json
{
  "mcpServers": {
    "backlog": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e", "BACKLOG_DOMAIN",
        "-e", "BACKLOG_API_KEY",
        "-e", "MAX_TOKENS",
        "-e", "OPTIMIZE_RESPONSE",
        "-e", "PREFIX",
        "ghcr.io/nulab/backlog-mcp-server"
      ],
      "env": {
        "BACKLOG_DOMAIN": "your-domain.backlog.com",
        "BACKLOG_API_KEY": "your-api-key",
        "MAX_TOKENS": "10000",
        "OPTIMIZE_RESPONSE": "true",
        "PREFIX": "backlog_"
      }
    }
  }
}
```

- `MAX_TOKENS`: Maximum number of tokens allowed in responses (default: 50000)
- `OPTIMIZE_RESPONSE`: Enable GraphQL-style field selection to optimize response size (default: false)
- `PREFIX`: Optional string prefix to prepend to all tool names (default: "")

### Keeping the Docker Image Up-to-Date

By default, Docker will use a locally cached image if it has already been pulled before.
To ensure you're always using the latest version of `ghcr.io/nulab/backlog-mcp-server`, consider one of the following methods:

#### Option 1: Use `--pull always` (recommended)

If you are using Docker 20.10 or later, you can modify the `args` array to include the `--pull always` flag:

```json
{
  "mcpServers": {
    "backlog": {
      "command": "docker",
      "args": [
        "run",
        "--pull", "always",
        "-i",
        "--rm",
        "-e", "BACKLOG_DOMAIN",
        "-e", "BACKLOG_API_KEY",
        "ghcr.io/nulab/backlog-mcp-server"
      ],
      "env": {
        "BACKLOG_DOMAIN": "your-domain.backlog.com",
        "BACKLOG_API_KEY": "your-api-key"
      }
    }
  }
}
```

This ensures that Docker always pulls the latest image from GitHub Container Registry before running.

#### Option 2: Manually pull the latest image
If your Docker version does not support --pull always, you can manually pull the latest image before running the server:

```
docker pull ghcr.io/nulab/backlog-mcp-server:latest
```

### Option 2: Manual Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/nulab/backlog-mcp-server.git
   cd backlog-mcp-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```
4. Set your json to use as MCP
  ```json
  {
    "mcpServers": {
      "backlog": {
        "command": "node",
        "args": [
          "your-repository-location/build/index.js"
        ],
        "env": {
          "BACKLOG_DOMAIN": "your-domain.backlog.com",
          "BACKLOG_API_KEY": "your-api-key"
        }
      }
    }
  }
  ```

## Available Tools

The server provides the following tools for interacting with Backlog:

### Space Tools

| Tool Name | Description |
|-----------|-------------|
| `get_space` | Returns information about the Backlog space |
| `get_users` | Returns list of users in the Backlog space |
| `get_myself` | Returns information about the authenticated user |
| `get_priorities` | Returns list of priorities |
| `get_resolutions` | Returns list of issue resolutions |
| `get_issue_types` | Returns list of issue types for a project |

### Project Tools

| Tool Name | Description |
|-----------|-------------|
| `get_project_list` | Returns list of projects |
| `add_project` | Creates a new project |
| `get_project` | Returns information about a specific project |
| `update_project` | Updates an existing project |
| `delete_project` | Deletes a project |
| `get_custom_fields` | Returns list of custom fields for a project |

### Issue Tools

| Tool Name | Description |
|-----------|-------------|
| `get_issue` | Returns information about a specific issue |
| `get_issues` | Returns list of issues |
| `count_issues` | Returns count of issues |
| `add_issue` | Creates a new issue in the specified project |
| `update_issue` | Updates an existing issue |
| `delete_issue` | Deletes an issue |

### Comment Tools

| Tool Name | Description |
|-----------|-------------|
| `get_issue_comments` | Returns list of comments for an issue |
| `add_issue_comment` | Adds a comment to an issue |

### Wiki Tools

| Tool Name | Description |
|-----------|-------------|
| `get_wiki_pages` | Returns list of Wiki pages |
| `get_wikis_count` | Returns count of wiki pages in a project |
| `get_wiki` | Returns information about a specific wiki page |
| `add_wiki` | Creates a new wiki page |

### Category Tools

| Tool Name | Description |
|-----------|-------------|
| `get_categories` | Returns list of categories for a project |

### Notification Tools

| Tool Name | Description |
|-----------|-------------|
| `get_notifications` | Returns list of notifications |
| `count_notifications` | Returns count of notifications |
| `reset_unread_notification_count` | Reset unread notification count |
| `mark_notification_as_read` | Mark a notification as read |

### Git Repository Tools

| Tool Name | Description |
|-----------|-------------|
| `get_git_repositories` | Returns list of Git repositories for a project |
| `get_git_repository` | Returns information about a specific Git repository |

### Pull Request Tools

| Tool Name | Description |
|-----------|-------------|
| `get_pull_requests` | Returns list of pull requests for a repository |
| `get_pull_requests_count` | Returns count of pull requests for a repository |
| `get_pull_request` | Returns information about a specific pull request |
| `add_pull_request` | Creates a new pull request |
| `update_pull_request` | Updates an existing pull request |
| `get_pull_request_comments` | Returns list of comments for a pull request |
| `add_pull_request_comment` | Adds a comment to a pull request |
| `update_pull_request_comment` | Updates a comment on a pull request |

### Watching Tools

| Tool Name | Description |
|-----------|-------------|
| `get_watching_list_items` | Returns list of watching items for a user |
| `get_watching_list_count` | Returns count of watching items for a user |

## Usage Examples

Once the MCP server is configured in AI agents, you can use the tools directly in your conversations. Here are some examples:

### Listing Projects

```
Could you list all my Backlog projects?
```

### Creating a New Issue

```
Create a new bug issue in the PROJECT-KEY project with high priority titled "Fix login page error"
```

### Getting Project Details

```
Show me the details of the PROJECT-KEY project
```

### Working with Git Repositories

```
List all Git repositories in the PROJECT-KEY project
```

### Managing Pull Requests

```
Show me all open pull requests in the repository "repo-name" of PROJECT-KEY project
```

```
Create a new pull request from branch "feature/new-feature" to "main" in the repository "repo-name" of PROJECT-KEY project
```

### Watching Items

```
Show me all items I'm watching 
```

### Using Field Selection

When the `OPTIMIZE_RESPONSE` option is enabled, you can specify which fields you want to retrieve using GraphQL-style syntax:

```
Show me the details of the PROJECT-KEY project, but only include the name, key, and description fields
```

The AI will use field selection to optimize the response:

```
get_project(projectIdOrKey: "PROJECT-KEY", fields: "{ name key description }")
```

This reduces response size and processing time, especially for large objects.

## Advanced Features

### Response Optimization

#### Field Selection

When enabled with `OPTIMIZE_RESPONSE=true`, you can use GraphQL-style syntax to select specific fields:

```
{
  id
  name
  description
  users {
    id
    name
  }
}
```

This allows you to:
- Reduce response size by requesting only needed fields
- Focus on specific data points
- Improve performance for large responses

#### Token Limiting

Large responses are automatically limited to prevent exceeding token limits:
- Default limit: 50,000 tokens
- Configurable via `MAX_TOKENS` environment variable
- Responses exceeding the limit are truncated with a message

### i18n / Overriding Descriptions

You can override the descriptions of tools by creating a `.backlog-mcp-serverrc.json` file in your **home directory**.

The file should contain a JSON object with the tool names as keys and the new descriptions as values.  
For example:

```json
{
  "TOOL_ADD_ISSUE_COMMENT_DESCRIPTION": "An alternative description",
  "TOOL_CREATE_PROJECT_DESCRIPTION": "Create a new project in Backlog"
}
```

When the server starts, it determines the final description for each tool based on the following priority:

1. Environment variables (e.g., `BACKLOG_MCP_TOOL_ADD_ISSUE_COMMENT_DESCRIPTION`)
2. Entries in `.backlog-mcp-serverrc.json` - Supported configuration file formats: .json, .yaml, .yml
3. Built-in fallback values (English)

Sample config: 

```json
{
  "mcpServers": {
    "backlog": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e", "BACKLOG_DOMAIN",
        "-e", "BACKLOG_API_KEY",
        "-v", "/yourcurrentdir/.backlog-mcp-serverrc.json:/root/.backlog-mcp-serverrc.json:ro",
        "ghcr.io/nulab/backlog-mcp-server"
      ],
      "env": {
        "BACKLOG_DOMAIN": "your-domain.backlog.com",
        "BACKLOG_API_KEY": "your-api-key"
      }
    }
  }
}
```

### Exporting Current Translations

You can export the current default translations (including any overrides) by running the binary with the --export-translations flag.

This will print all tool descriptions to stdout, including any customizations you have made.

Example:

```bash
docker run -i --rm ghcr.io/nulab/backlog-mcp-server node build/index.js --export-translations
```

or 

```bash
npx github:nulab/backlog-mcp-server --export-translations
```

### Using a Japanese Translation Template
A sample Japanese configuration file is provided at:

```bash
translationConfig/.backlog-mcp-serverrc.json.example
```

To use it, copy it to your home directory as .backlog-mcp-serverrc.json:

You can then edit the file to customize the descriptions as needed.

### Using Environment Variables
Alternatively, you can override tool descriptions via environment variables.

The environment variable names are based on the tool keys, prefixed with BACKLOG_MCP_ and written in uppercase.

Example:
To override the TOOL_ADD_ISSUE_COMMENT_DESCRIPTION:

```json
{
  "mcpServers": {
    "backlog": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e", "BACKLOG_DOMAIN",
        "-e", "BACKLOG_API_KEY",
        "-e", "BACKLOG_MCP_TOOL_ADD_ISSUE_COMMENT_DESCRIPTION"
        "ghcr.io/nulab/backlog-mcp-server"
      ],
      "env": {
        "BACKLOG_DOMAIN": "your-domain.backlog.com",
        "BACKLOG_API_KEY": "your-api-key",
        "BACKLOG_MCP_TOOL_ADD_ISSUE_COMMENT_DESCRIPTION": "An alternative description"
      }
    }
  }
}
```

The server loads the config file synchronously at startup.

Environment variables always take precedence over the config file.

## Development

### Running Tests

```bash
npm test
```

### Adding New Tools

1. Create a new file in `src/tools/` following the pattern of existing tools
2. Create a corresponding test file
3. Add the new tool to `src/tools/tools.ts`
4. Build and test your changes

### Command Line Options

The server supports several command line options:

- `--export-translations`: Export all translation keys and values
- `--optimize-response`: Enable GraphQL-style field selection
- `--max-tokens=NUMBER`: Set maximum token limit for responses
- `--prefix=STRING`: Optional string prefix to prepend to all generated outputs

Example:
```bash
node build/index.js --optimize-response --max-tokens=100000 --prefix="[BOT] "
```

## License

This project is licensed under the [MIT License](./LICENSE).

Please note: This tool is provided under the MIT License **without any warranty or official support**.  
Use it at your own risk after reviewing the contents and determining its suitability for your needs.  
If you encounter any issues, please report them via [GitHub Issues](../../issues).
