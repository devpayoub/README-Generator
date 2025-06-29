"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Github, FileText, Sparkles, Zap, Code2, Rocket } from "lucide-react"
import { RepositoryAnalyzer } from "@/components/repository-analyzer"
import { ReadmePreview } from "@/components/readme-preview"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function Home() {
  const [repoUrl, setRepoUrl] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [repoData, setRepoData] = useState(null)
  const [generatedReadme, setGeneratedReadme] = useState("")
  const [error, setError] = useState("")
  const [headerStyle, setHeaderStyle] = useState("classic")

  const handleAnalyze = async () => {
    if (!repoUrl.trim()) {
      setError("Please enter a valid GitHub repository URL")
      return
    }

    setIsAnalyzing(true)
    setError("")
    setRepoData(null)
    setGeneratedReadme("")

    try {
      const analyzer = new RepositoryAnalyzer()
      const data = await analyzer.analyzeRepository(repoUrl)
      setRepoData(data)

      const readme = await analyzer.generateReadme(data, headerStyle)
      setGeneratedReadme(readme)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze repository")
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fillRule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%239C92AC&quot; fillOpacity=&quot;0.1&quot;%3E%3Ccircle cx=&quot;30&quot; cy=&quot;30&quot; r=&quot;2&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>

      <div className="relative max-w-7xl mx-auto p-6 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-8 pt-16">
          <div className="flex items-center justify-center gap-3">
            <div className="relative">
              <Github className="h-12 w-12 text-white" />
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full animate-pulse"></div>
            </div>
            <Zap className="h-8 w-8 text-yellow-400 animate-bounce" />
            <div className="relative">
              <FileText className="h-12 w-12 text-white" />
              <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-400" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              AI README Generator
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Transform any GitHub repository into a stunning, comprehensive README with AI-powered code analysis
            </p>
          </div>

          {/* Feature highlights */}
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white">
              <Code2 className="h-4 w-4 text-blue-400" />
              Smart Code Analysis
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white">
              <Rocket className="h-4 w-4 text-green-400" />
              Auto Framework Detection
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              Professional Templates
            </div>
          </div>
        </div>

        {/* Input Form */}
        <Card className="max-w-3xl mx-auto bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">Analyze Repository</CardTitle>
            <CardDescription className="text-gray-300">
              Enter a GitHub repository URL to generate a professional README with AI insights
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex gap-3">
                <Input
                  placeholder="https://github.com/username/repository"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400"
                  disabled={isAnalyzing}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Header Style</label>
                <Select value={headerStyle} onValueChange={setHeaderStyle} disabled={isAnalyzing}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-purple-400 focus:ring-purple-400">
                    <SelectValue placeholder="Select header style" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/20">
                    <SelectItem value="classic" className="text-white hover:bg-white/10">
                      Classic - Centered Layout
                    </SelectItem>
                    <SelectItem value="modern" className="text-white hover:bg-white/10">
                      Modern - Left-aligned Layout
                    </SelectItem>
                    <SelectItem value="compact" className="text-white hover:bg-white/10">
                      Compact - Inline Layout
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !repoUrl.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-2 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate README
                  </>
                )}
              </Button>
            </div>
            {error && (
              <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-4 rounded-lg backdrop-blur-sm">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {repoData && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Repository Analysis */}
            <Card className="xl:col-span-1 bg-white/10 backdrop-blur-lg border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Github className="h-5 w-5 text-purple-400" />
                  Repository Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-bold text-xl text-white">{repoData.name}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {repoData.description || "No description available"}
                  </p>
                  {repoData.projectType && (
                    <div className="inline-block bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full px-3 py-1">
                      <span className="text-blue-300 text-xs font-medium">{repoData.projectType}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-2xl font-bold text-yellow-400">{repoData.stars}</div>
                    <div className="text-xs text-gray-400">Stars</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-400">{repoData.forks}</div>
                    <div className="text-xs text-gray-400">Forks</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-300">Primary Language:</span>
                    <div className="mt-1">
                      <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded border border-blue-500/30">
                        {repoData.language || "Not detected"}
                      </span>
                    </div>
                  </div>

                  {repoData.frameworks && repoData.frameworks.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-300">Frameworks & Tools:</span>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {repoData.frameworks.map((framework, index) => (
                          <span
                            key={index}
                            className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded border border-purple-500/30"
                          >
                            {framework}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {repoData.dependencies && repoData.dependencies.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-300">Key Dependencies:</span>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {repoData.dependencies.slice(0, 6).map((dep, index) => (
                          <span
                            key={index}
                            className="bg-green-500/20 text-green-300 text-xs px-2 py-1 rounded border border-green-500/30"
                          >
                            {dep}
                          </span>
                        ))}
                        {repoData.dependencies.length > 6 && (
                          <span className="text-xs text-gray-400 px-2 py-1">
                            +{repoData.dependencies.length - 6} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Generated README Preview */}
            <div className="xl:col-span-2">
              <ReadmePreview content={generatedReadme} repoData={repoData} headerStyle={headerStyle} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
