export interface RepoData {
  name: string
  description: string
  language: string
  stars: number
  forks: number
  license: string
  frameworks: string[]
  dependencies: string[]
  fileStructure: string[]
  hasReadme: boolean
  packageInfo: any
  mainFiles: string[]
  owner: string
  url: string
  projectType: string
  startCommands: string[]
  codeAnalysis: {
    purpose: string
    features: string[]
    architecture: string
    detailedAnalysis: {
      isFullStack: boolean
      hasAPI: boolean
      hasDatabase: boolean
      hasAuth: boolean
      hasTests: boolean
      hasDocker: boolean
      deploymentReady: boolean
    }
  }
  lastCommit: string
  languagePercentage: string
  languageCount: number
  entryPoint: string
  packageManager: string[]
  hasContainer: boolean
}

export class RepositoryAnalyzer {
  private async fetchGitHubAPI(url: string) {
    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "README-Generator",
      },
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  private parseGitHubUrl(url: string): { owner: string; repo: string } {
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)/)
    if (!match) {
      throw new Error("Invalid GitHub URL format")
    }
    return { owner: match[1], repo: match[2] }
  }

  private async analyzeCodeContent(
    owner: string,
    repo: string,
    files: any[],
  ): Promise<{
    purpose: string
    features: string[]
    architecture: string
    detailedAnalysis: {
      isFullStack: boolean
      hasAPI: boolean
      hasDatabase: boolean
      hasAuth: boolean
      hasTests: boolean
      hasDocker: boolean
      deploymentReady: boolean
    }
  }> {
    let purpose = "A modern software application with advanced features and robust architecture."
    const features: string[] = []
    let architecture = "Modular architecture with clean separation of concerns"

    const detailedAnalysis = {
      isFullStack: false,
      hasAPI: false,
      hasDatabase: false,
      hasAuth: false,
      hasTests: false,
      hasDocker: false,
      deploymentReady: false,
    }

    // Analyze key files for comprehensive understanding
    const keyFiles = [
      "package.json",
      "README.md",
      "app.js",
      "index.js",
      "main.py",
      "requirements.txt",
      "Dockerfile",
      "docker-compose.yml",
      "pyproject.toml",
    ]

    for (const fileName of keyFiles) {
      try {
        const file = await this.fetchGitHubAPI(`https://api.github.com/repos/${owner}/${repo}/contents/${fileName}`)
        if (file.content) {
          const content = atob(file.content).toLowerCase()

          if (fileName === "package.json") {
            const packageData = JSON.parse(atob(file.content))

            if (packageData.dependencies) {
              const deps = packageData.dependencies
              const devDeps = packageData.devDependencies || {}

              // Framework detection
              if (deps.next) {
                purpose =
                  "A Next.js full-stack web application with modern React architecture and server-side capabilities."
                architecture = "Next.js App Router with React Server Components and API routes"
                detailedAnalysis.isFullStack = true
                features.push("Server-Side Rendering (SSR)")
                features.push("Static Site Generation (SSG)")
                features.push("API Routes")
                features.push("React Server Components")
              } else if (deps.react) {
                purpose = "A React web application with component-based architecture and modern development practices."
                architecture = "Component-based React architecture with hooks and context"
                features.push("Component-based UI")
                features.push("Virtual DOM")
                features.push("State Management")
                features.push("Modern React Hooks")
              } else if (deps.vue) {
                purpose = "A Vue.js progressive web application with reactive data binding and component composition."
                architecture = "Vue.js progressive framework with composition API"
                features.push("Progressive Framework")
                features.push("Reactive Data Binding")
                features.push("Component Composition")
              } else if (deps.express) {
                purpose = "A Node.js Express server application providing RESTful API services with middleware support."
                architecture = "RESTful API server architecture with Express.js middleware"
                detailedAnalysis.hasAPI = true
                features.push("RESTful API")
                features.push("Middleware Support")
                features.push("Route Handling")
              }

              // Additional features
              if (deps.mongoose || deps["@prisma/client"]) {
                features.push("Database Integration")
                features.push("ORM/ODM Support")
                detailedAnalysis.hasDatabase = true
              }
              if (deps.passport || deps["next-auth"]) {
                features.push("Authentication System")
                features.push("Session Management")
                detailedAnalysis.hasAuth = true
              }
              if (deps["socket.io"]) {
                features.push("Real-time Communication")
                features.push("WebSocket Support")
              }
              if (deps.stripe) {
                features.push("Payment Processing")
                features.push("E-commerce Integration")
              }
              if (deps.typescript || devDeps.typescript) {
                features.push("Type Safety")
                features.push("Enhanced Developer Experience")
              }
              if (deps.tailwindcss || devDeps.tailwindcss) {
                features.push("Modern Styling")
                features.push("Utility-first CSS")
              }

              // Testing
              if (devDeps.jest || devDeps.vitest || devDeps.cypress) {
                features.push("Automated Testing")
                features.push("Test Coverage")
                detailedAnalysis.hasTests = true
              }
            }
          }

          if (fileName === "pyproject.toml") {
            purpose = "A Python application with modern packaging and dependency management using Poetry."
            architecture = "Python modular architecture with clean package structure"
            features.push("Modern Python Packaging")
            features.push("Dependency Management")
            features.push("Virtual Environment Support")
          }

          // Docker detection
          if (fileName === "Dockerfile" || fileName === "docker-compose.yml") {
            detailedAnalysis.hasDocker = true
            features.push("Containerized Deployment")
            features.push("Docker Support")
            detailedAnalysis.deploymentReady = true
          }
        }
      } catch (error) {
        // File doesn't exist, continue
      }
    }

    // Analyze file structure
    const fileNames = files.map((f) => f.name.toLowerCase())

    if (fileNames.includes("vercel.json") || fileNames.includes("netlify.toml")) {
      detailedAnalysis.deploymentReady = true
      features.push("Cloud Deployment")
      features.push("Production Ready")
    }

    if (fileNames.some((f) => f.includes("test") || f.includes("spec"))) {
      detailedAnalysis.hasTests = true
      if (!features.some((f) => f.includes("Testing"))) {
        features.push("Test Coverage")
        features.push("Quality Assurance")
      }
    }

    if (fileNames.includes(".github")) {
      features.push("CI/CD Pipeline")
      features.push("GitHub Actions")
    }

    return { purpose, features, architecture, detailedAnalysis }
  }

  private detectFrameworks(files: any[], packageInfo: any): string[] {
    const frameworks = new Set<string>()

    if (packageInfo?.dependencies || packageInfo?.devDependencies) {
      const allDeps = { ...packageInfo.dependencies, ...packageInfo.devDependencies }

      if (allDeps.react) frameworks.add("React")
      if (allDeps.next) frameworks.add("Next.js")
      if (allDeps.vue) frameworks.add("Vue.js")
      if (allDeps.angular) frameworks.add("Angular")
      if (allDeps.express) frameworks.add("Express.js")
      if (allDeps.fastify) frameworks.add("Fastify")
      if (allDeps.nestjs) frameworks.add("NestJS")
      if (allDeps.typescript) frameworks.add("TypeScript")
      if (allDeps.tailwindcss) frameworks.add("Tailwind CSS")
      if (allDeps.sass || allDeps.scss) frameworks.add("Sass/SCSS")
      if (allDeps.prisma) frameworks.add("Prisma")
      if (allDeps.mongoose) frameworks.add("MongoDB")
      if (allDeps.redis) frameworks.add("Redis")
      if (allDeps.graphql) frameworks.add("GraphQL")
      if (allDeps.stripe) frameworks.add("Stripe")
      if (allDeps["socket.io"]) frameworks.add("Socket.IO")
    }

    const fileNames = files.map((f) => f.name.toLowerCase())

    if (fileNames.includes("dockerfile")) frameworks.add("Docker")
    if (fileNames.includes("docker-compose.yml")) frameworks.add("Docker Compose")
    if (fileNames.includes("requirements.txt")) frameworks.add("Python")
    if (fileNames.includes("pyproject.toml")) frameworks.add("Poetry")
    if (fileNames.includes("cargo.toml")) frameworks.add("Rust")
    if (fileNames.includes("go.mod")) frameworks.add("Go")

    return Array.from(frameworks)
  }

  private detectProjectType(files: any[], packageInfo: any, language: string): string {
    if (packageInfo?.dependencies) {
      const deps = packageInfo.dependencies
      if (deps.react && deps.next) return "Next.js Application"
      if (deps.react) return "React Application"
      if (deps.vue) return "Vue.js Application"
      if (deps.angular) return "Angular Application"
      if (deps.express) return "Express.js API"
      if (deps.fastify) return "Fastify API"
      if (deps.nestjs) return "NestJS Application"
    }

    const fileNames = files.map((f) => f.name.toLowerCase())

    if (fileNames.includes("dockerfile")) return "Containerized Application"
    if (fileNames.includes("pyproject.toml")) return "Python Poetry Project"
    if (fileNames.includes("requirements.txt")) return "Python Application"
    if (fileNames.includes("cargo.toml")) return "Rust Application"
    if (fileNames.includes("go.mod")) return "Go Application"
    if (fileNames.includes("pom.xml")) return "Java Maven Project"
    if (fileNames.includes("build.gradle")) return "Java Gradle Project"

    return `${language} Project`
  }

  private detectPackageManagers(files: any[], packageInfo: any): string[] {
    const managers: string[] = []
    const fileNames = files.map((f) => f.name.toLowerCase())

    if (packageInfo) managers.push("npm")
    if (fileNames.includes("yarn.lock")) managers.push("yarn")
    if (fileNames.includes("pnpm-lock.yaml")) managers.push("pnpm")
    if (fileNames.includes("pyproject.toml")) managers.push("poetry")
    if (fileNames.includes("requirements.txt")) managers.push("pip")
    if (fileNames.includes("environment.yaml") || fileNames.includes("environment.yml")) managers.push("conda")
    if (fileNames.includes("dockerfile")) managers.push("docker")

    return managers.length > 0 ? managers : ["npm"]
  }

  private detectEntryPoint(files: any[], packageInfo: any): string {
    if (packageInfo?.main) return packageInfo.main
    if (packageInfo?.scripts?.start) return "main application"

    const fileNames = files.map((f) => f.name.toLowerCase())
    if (fileNames.includes("main.py")) return "main.py"
    if (fileNames.includes("app.py")) return "app.py"
    if (fileNames.includes("index.js")) return "index.js"
    if (fileNames.includes("server.js")) return "server.js"

    return "main application"
  }

  private generateStartCommands(packageInfo: any, frameworks: string[], language: string): string[] {
    const commands: string[] = []

    if (packageInfo?.scripts) {
      if (packageInfo.scripts.dev) commands.push("npm run dev")
      else if (packageInfo.scripts.start) commands.push("npm start")
      else if (packageInfo.scripts.serve) commands.push("npm run serve")

      if (packageInfo.scripts.build) commands.push("npm run build")
      if (packageInfo.scripts.test) commands.push("npm test")
    } else {
      if (language === "Python") {
        commands.push("python main.py")
      } else if (language === "Go") {
        commands.push("go run main.go")
      } else if (language === "Rust") {
        commands.push("cargo run")
      } else if (language === "Java") {
        commands.push("mvn spring-boot:run")
      }
    }

    return commands
  }

  private extractDependencies(packageInfo: any): string[] {
    if (!packageInfo?.dependencies) return []

    return Object.keys(packageInfo.dependencies)
      .filter((dep) => !dep.startsWith("@types/"))
      .slice(0, 15)
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString)
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
    return months[date.getMonth()]
  }

  async analyzeRepository(repoUrl: string): Promise<RepoData> {
    const { owner, repo } = this.parseGitHubUrl(repoUrl)

    const repoInfo = await this.fetchGitHubAPI(`https://api.github.com/repos/${owner}/${repo}`)
    const contents = await this.fetchGitHubAPI(`https://api.github.com/repos/${owner}/${repo}/contents`)

    // Get language statistics
    const languages = await this.fetchGitHubAPI(`https://api.github.com/repos/${owner}/${repo}/languages`)
    const totalBytes = Object.values(languages).reduce((sum: number, bytes: any) => sum + bytes, 0)
    const primaryLanguage = Object.keys(languages)[0]
    const primaryPercentage = primaryLanguage
      ? Math.round(((languages[primaryLanguage] as number) / totalBytes) * 100)
      : 0

    let packageInfo = null
    try {
      const packageFile = await this.fetchGitHubAPI(
        `https://api.github.com/repos/${owner}/${repo}/contents/package.json`,
      )
      if (packageFile.content) {
        const content = atob(packageFile.content)
        packageInfo = JSON.parse(content)
      }
    } catch (error) {
      // package.json doesn't exist
    }

    const frameworks = this.detectFrameworks(contents, packageInfo)
    const dependencies = this.extractDependencies(packageInfo)
    const projectType = this.detectProjectType(contents, packageInfo, repoInfo.language)
    const startCommands = this.generateStartCommands(packageInfo, frameworks, repoInfo.language)
    const codeAnalysis = await this.analyzeCodeContent(owner, repo, contents)
    const packageManager = this.detectPackageManagers(contents, packageInfo)
    const entryPoint = this.detectEntryPoint(contents, packageInfo)

    const mainFiles = contents
      .filter(
        (file: any) =>
          file.name.match(/\.(js|ts|py|java|go|rs|cpp|c)$/) ||
          file.name === "index.html" ||
          file.name === "main.py" ||
          file.name === "app.js",
      )
      .map((file: any) => file.name)
      .slice(0, 5)

    const hasReadme = contents.some((file: any) => file.name.toLowerCase().startsWith("readme"))
    const hasContainer = contents.some((file: any) => file.name.toLowerCase().includes("docker"))

    return {
      name: repoInfo.name,
      description: repoInfo.description || "",
      language: repoInfo.language || "Unknown",
      stars: repoInfo.stargazers_count || 0,
      forks: repoInfo.forks_count || 0,
      license: repoInfo.license?.name || "",
      frameworks,
      dependencies,
      fileStructure: contents.map((file: any) => file.name),
      hasReadme,
      packageInfo,
      mainFiles,
      owner,
      url: repoUrl,
      projectType,
      startCommands,
      codeAnalysis,
      lastCommit: this.formatDate(repoInfo.updated_at),
      languagePercentage: `${primaryPercentage}.0%`,
      languageCount: Object.keys(languages).length,
      entryPoint,
      packageManager,
      hasContainer,
    }
  }

  async generateReadme(repoData: RepoData): Promise<string> {
    const {
      name,
      description,
      language,
      frameworks,
      owner,
      url,
      codeAnalysis,
      packageManager,
      entryPoint,
      hasContainer,
    } = repoData

    // Generate the exact template structure
    let readme = `<p align="center">\n`
    readme += `    <img src="https://raw.githubusercontent.com/PKief/vscode-material-icon-theme/ec559a9f6bfd399b82bb44393651661b08aaf7ba/icons/folder-markdown-open.svg" align="center" width="30%">\n`
    readme += `</p>\n`
    readme += `<p align="center"><h1 align="center">${name.toUpperCase()}</h1></p>\n`
    readme += `<p align="center">\n`
    readme += `\t<em>${codeAnalysis.purpose}</em>\n`
    readme += `</p>\n`
    readme += `<p align="center">\n`
    readme += `\t<img src="https://img.shields.io/github/license/${owner}/${name}?style=default&logo=opensourceinitiative&logoColor=white&color=0080ff" alt="license">\n`
    readme += `\t<img src="https://img.shields.io/github/last-commit/${owner}/${name}?style=default&logo=git&logoColor=white&color=0080ff" alt="last-commit">\n`
    readme += `\t<img src="https://img.shields.io/github/languages/top/${owner}/${name}?style=default&color=0080ff" alt="repo-top-language">\n`
    readme += `\t<img src="https://img.shields.io/github/languages/count/${owner}/${name}?style=default&color=0080ff" alt="repo-language-count">\n`
    readme += `</p>\n`
    readme += `<p align="center"><!-- default option, no dependency badges. -->\n`
    readme += `</p>\n`
    readme += `<p align="center">\n`
    readme += `\t<!-- default option, no dependency badges. -->\n`
    readme += `</p>\n`
    readme += `<br>\n\n`

    // Table of Contents
    readme += `## Table of Contents\n\n`
    readme += `- [ Overview](#-overview)\n`
    readme += `- [ Features](#-features)\n`
    readme += `- [ Project Structure](#-project-structure)\n`
    readme += `  - [ Project Index](#-project-index)\n`
    readme += `- [ Getting Started](#-getting-started)\n`
    readme += `  - [ Prerequisites](#-prerequisites)\n`
    readme += `  - [ Installation](#-installation)\n`
    readme += `  - [ Usage](#-usage)\n`
    readme += `  - [ Testing](#-testing)\n`
    readme += `- [ Project Roadmap](#-project-roadmap)\n`
    readme += `- [ Contributing](#-contributing)\n`
    readme += `- [ License](#-license)\n`
    readme += `- [ Acknowledgments](#-acknowledgments)\n\n`

    readme += `---\n\n`

    // Overview
    readme += `## Overview\n\n`
    if (description) {
      readme += `${description}\n\n`
    }
    readme += `${codeAnalysis.architecture}\n\n`

    readme += `---\n\n`

    // Features
    readme += `## Features\n\n`
    if (codeAnalysis.features.length > 0) {
      codeAnalysis.features.forEach((feature) => {
        readme += `- ${feature}\n`
      })
    } else {
      readme += `- Modern ${language} application\n`
      readme += `- Clean and maintainable code structure\n`
      readme += `- Responsive and user-friendly interface\n`
    }
    readme += `\n---\n\n`

    // Project Structure
    readme += `## Project Structure\n\n`
    readme += `\`\`\`sh\n`
    readme += `└── ${name}/\n`
    repoData.fileStructure.slice(0, 20).forEach((file, index) => {
      const isLast = index === Math.min(repoData.fileStructure.length - 1, 19)
      const prefix = isLast ? "    └──" : "    ├──"
      readme += `${prefix} ${file}\n`
    })
    if (repoData.fileStructure.length > 20) {
      readme += `    └── ... (${repoData.fileStructure.length - 20} more files)\n`
    }
    readme += `\`\`\`\n\n`

    // Project Index
    readme += `### Project Index\n`
    readme += `<details open>\n`
    readme += `\t<summary><b><code>${name.toUpperCase()}/</code></b></summary>\n`
    readme += `\t<details>\n`
    readme += `\t\t<summary><b>__root__</b></summary>\n`
    readme += `\t\t<blockquote>\n`
    readme += `\t\t\t<table>\n`

    // Add key files to the index
    const keyFiles = repoData.fileStructure.filter((file) =>
      ["package.json", "Dockerfile", "README.md", "pyproject.toml", "requirements.txt"].includes(file),
    )

    keyFiles.slice(0, 6).forEach((file) => {
      readme += `\t\t\t<tr>\n`
      readme += `\t\t\t\t<td><b><a href='${url}/blob/master/${file}'>${file}</a></b></td>\n`
      readme += `\t\t\t\t<td>Core configuration and setup file</td>\n`
      readme += `\t\t\t</tr>\n`
    })

    readme += `\t\t\t</table>\n`
    readme += `\t\t</blockquote>\n`
    readme += `\t</details>\n`
    readme += `</details>\n\n`

    readme += `---\n\n`

    // Getting Started
    readme += `## Getting Started\n\n`

    // Prerequisites
    readme += `### Prerequisites\n\n`
    readme += `Before getting started with ${name}, ensure your runtime environment meets the following requirements:\n\n`
    readme += `- **Programming Language:** ${language}\n`

    if (packageManager.length > 0) {
      const managers = packageManager.map((pm) => pm.charAt(0).toUpperCase() + pm.slice(1)).join(", ")
      readme += `- **Package Manager:** ${managers}\n`
    }

    if (hasContainer) {
      readme += `- **Container Runtime:** Docker\n`
    }

    readme += `\n`

    // Installation
    readme += `### Installation\n\n`
    readme += `Install ${name} using one of the following methods:\n\n`
    readme += `**Build from source:**\n\n`
    readme += `1. Clone the ${name} repository:\n`
    readme += `\`\`\`sh\n`
    readme += `❯ git clone ${url}\n`
    readme += `\`\`\`\n\n`
    readme += `2. Navigate to the project directory:\n`
    readme += `\`\`\`sh\n`
    readme += `❯ cd ${name}\n`
    readme += `\`\`\`\n\n`
    readme += `3. Install the project dependencies:\n\n`

    // Add installation methods for each package manager
    packageManager.forEach((manager) => {
      const badgeUrl = this.getPackageManagerBadge(manager)
      const installCommand = this.getInstallCommand(manager)

      readme += `**Using \`${manager}\`** &nbsp; [<img align="center" src="${badgeUrl}" />](${this.getPackageManagerUrl(manager)})\n\n`
      readme += `\`\`\`sh\n`
      readme += `❯ ${installCommand}\n`
      readme += `\`\`\`\n\n`
    })

    // Usage
    readme += `### Usage\n`
    readme += `Run ${name} using the following command:\n`

    packageManager.forEach((manager) => {
      const badgeUrl = this.getPackageManagerBadge(manager)
      const runCommand = this.getRunCommand(manager, entryPoint)

      readme += `**Using \`${manager}\`** &nbsp; [<img align="center" src="${badgeUrl}" />](${this.getPackageManagerUrl(manager)})\n\n`
      readme += `\`\`\`sh\n`
      readme += `❯ ${runCommand}\n`
      readme += `\`\`\`\n\n`
    })

    // Testing
    if (codeAnalysis.detailedAnalysis?.hasTests) {
      readme += `### Testing\n`
      readme += `Run the test suite using the following command:\n`

      packageManager.forEach((manager) => {
        const badgeUrl = this.getPackageManagerBadge(manager)
        const testCommand = this.getTestCommand(manager)

        readme += `**Using \`${manager}\`** &nbsp; [<img align="center" src="${badgeUrl}" />](${this.getPackageManagerUrl(manager)})\n\n`
        readme += `\`\`\`sh\n`
        readme += `❯ ${testCommand}\n`
        readme += `\`\`\`\n\n`
      })
    }

    readme += `---\n\n`

    // Project Roadmap
    readme += `## Project Roadmap\n\n`
    readme += `- [X] **\`Task 1\`**: <strike>Implement core functionality.</strike>\n`
    readme += `- [ ] **\`Task 2\`**: Add comprehensive testing suite.\n`
    readme += `- [ ] **\`Task 3\`**: Enhance user interface and experience.\n\n`

    readme += `---\n\n`

    // Contributing
    readme += `## Contributing\n\n`
    readme += `- **💬 [Join the Discussions](${url}/discussions)**: Share your insights, provide feedback, or ask questions.\n`
    readme += `- **🐛 [Report Issues](${url}/issues)**: Submit bugs found or log feature requests for the \`${name}\` project.\n`
    readme += `- **💡 [Submit Pull Requests](${url}/blob/main/CONTRIBUTING.md)**: Review open PRs, and submit your own PRs.\n\n`

    readme += `<details closed>\n`
    readme += `<summary>Contributing Guidelines</summary>\n\n`
    readme += `1. **Fork the Repository**: Start by forking the project repository to your github account.\n`
    readme += `2. **Clone Locally**: Clone the forked repository to your local machine using a git client.\n`
    readme += `   \`\`\`sh\n`
    readme += `   git clone ${url}\n`
    readme += `   \`\`\`\n`
    readme += `3. **Create a New Branch**: Always work on a new branch, giving it a descriptive name.\n`
    readme += `   \`\`\`sh\n`
    readme += `   git checkout -b new-feature-x\n`
    readme += `   \`\`\`\n`
    readme += `4. **Make Your Changes**: Develop and test your changes locally.\n`
    readme += `5. **Commit Your Changes**: Commit with a clear message describing your updates.\n`
    readme += `   \`\`\`sh\n`
    readme += `   git commit -m 'Implemented new feature x.'\n`
    readme += `   \`\`\`\n`
    readme += `6. **Push to github**: Push the changes to your forked repository.\n`
    readme += `   \`\`\`sh\n`
    readme += `   git push origin new-feature-x\n`
    readme += `   \`\`\`\n`
    readme += `7. **Submit a Pull Request**: Create a PR against the original project repository. Clearly describe the changes and their motivations.\n`
    readme += `8. **Review**: Once your PR is reviewed and approved, it will be merged into the main branch. Congratulations on your contribution!\n`
    readme += `</details>\n\n`

    readme += `<details closed>\n`
    readme += `<summary>Contributor Graph</summary>\n`
    readme += `<br>\n`
    readme += `<p align="left">\n`
    readme += `   <a href="${url}/graphs/contributors">\n`
    readme += `      <img src="https://contrib.rocks/image?repo=${owner}/${name}">\n`
    readme += `   </a>\n`
    readme += `</p>\n`
    readme += `</details>\n\n`

    readme += `---\n\n`

    // License
    readme += `## License\n\n`
    if (repoData.license) {
      readme += `This project is protected under the [${repoData.license}](${url}/blob/main/LICENSE) License. For more details, refer to the [LICENSE](${url}/blob/main/LICENSE) file.\n\n`
    } else {
      readme += `This project is protected under the [SELECT-A-LICENSE](https://choosealicense.com/licenses) License. For more details, refer to the [LICENSE](https://choosealicense.com/licenses/) file.\n\n`
    }

    readme += `---\n\n`

    // Acknowledgments
    readme += `## Acknowledgments\n\n`
    readme += `- List any resources, contributors, inspiration, etc. here.\n\n`

    readme += `---\n\n`

    return readme
  }

  private getPackageManagerBadge(manager: string): string {
    const badges = {
      npm: "https://img.shields.io/badge/npm-CB3837.svg?style=flat-square&logo=npm&logoColor=white",
      yarn: "https://img.shields.io/badge/Yarn-2C8EBB.svg?style=flat-square&logo=yarn&logoColor=white",
      pnpm: "https://img.shields.io/badge/pnpm-F69220.svg?style=flat-square&logo=pnpm&logoColor=white",
      poetry: "https://img.shields.io/endpoint?url=https://python-poetry.org/badge/v0.json",
      pip: "https://img.shields.io/badge/Pip-3776AB.svg?style=flat-square&logo=pypi&logoColor=white",
      conda: "https://img.shields.io/badge/conda-342B029.svg?style=flat-square&logo=anaconda&logoColor=white",
      docker: "https://img.shields.io/badge/Docker-2CA5E0.svg?style=flat-square&logo=docker&logoColor=white",
    }
    return badges[manager] || badges.npm
  }

  private getPackageManagerUrl(manager: string): string {
    const urls = {
      npm: "https://www.npmjs.com/",
      yarn: "https://yarnpkg.com/",
      pnpm: "https://pnpm.io/",
      poetry: "https://python-poetry.org/",
      pip: "https://pypi.org/project/pip/",
      conda: "https://docs.conda.io/",
      docker: "https://www.docker.com/",
    }
    return urls[manager] || urls.npm
  }

  private getInstallCommand(manager: string): string {
    const commands = {
      npm: "npm install",
      yarn: "yarn install",
      pnpm: "pnpm install",
      poetry: "poetry install",
      pip: "pip install -r requirements.txt",
      conda: "conda env create -f environment.yaml",
      docker: "docker build -t project-name .",
    }
    return commands[manager] || commands.npm
  }

  private getRunCommand(manager: string, entryPoint: string): string {
    const commands = {
      npm: "npm start",
      yarn: "yarn start",
      pnpm: "pnpm start",
      poetry: `poetry run python ${entryPoint}`,
      pip: `python ${entryPoint}`,
      conda: `conda activate {venv}\n❯ python ${entryPoint}`,
      docker: "docker run -it project-name",
    }
    return commands[manager] || `node ${entryPoint}`
  }

  private getTestCommand(manager: string): string {
    const commands = {
      npm: "npm test",
      yarn: "yarn test",
      pnpm: "pnpm test",
      poetry: "poetry run pytest",
      pip: "pytest",
      conda: "conda activate {venv}\n❯ pytest",
      docker: "docker run -it project-name npm test",
    }
    return commands[manager] || "npm test"
  }
}
