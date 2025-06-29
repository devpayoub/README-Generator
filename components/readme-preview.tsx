"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Download, Eye, Code, Github } from "lucide-react"
import type { RepoData } from "./repository-analyzer"

interface ReadmePreviewProps {
  content: string
  repoData: RepoData
  headerStyle?: string
}

export function ReadmePreview({ content, repoData, headerStyle = "classic" }: ReadmePreviewProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "README.md"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const renderMarkdown = (markdown: string) => {
    return markdown
      .replace(/^# (.*$)/gm, '<h1 class="text-4xl font-bold mb-6 text-white">$1</h1>')
      .replace(
        /^## (.*$)/gm,
        '<h2 class="text-2xl font-semibold mb-4 mt-8 text-white border-b border-gray-600/30 pb-2">$1</h2>',
      )
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-medium mb-3 mt-6 text-gray-200">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, "<strong class='text-white font-semibold'>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em class='text-gray-300 italic'>$1</em>")
      .replace(
        /`([^`]+)`/g,
        '<code class="bg-gray-700/30 text-gray-200 px-2 py-1 rounded text-sm border border-gray-600/30">$1</code>',
      )
      .replace(
        /```([\s\S]*?)```/g,
        '<pre class="bg-gray-900/50 border border-gray-600/30 p-4 rounded-lg overflow-x-auto my-4"><code class="text-green-300 text-sm">$1</code></pre>',
      )
      .replace(/^- (.*$)/gm, '<li class="ml-6 mb-1 text-gray-300 list-disc">$1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-6 mb-1 text-gray-300 list-decimal">$1</li>')
      .replace(
        /\[([^\]]+)\]$$([^)]+)$$/g,
        '<a href="$2" class="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">$1</a>',
      )
      .replace(/\n/g, "<br>")
      .replace(/\|([^|]+)\|/g, '<td class="border border-gray-600/30 px-3 py-2 text-gray-300">$1</td>')
  }

  const getStyleDisplayName = () => {
    switch (headerStyle) {
      case "classic":
        return "Classic"
      case "modern":
        return "Modern"
      case "compact":
        return "Compact"
      default:
        return "Classic"
    }
  }

  return (
    <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-600/30 shadow-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <Eye className="h-5 w-5 text-gray-400" />
            Generated README ({getStyleDisplayName()} Style)
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(repoData.url, "_blank")}
              className="bg-gray-700/30 border-gray-600/50 text-white hover:bg-gray-600/50 text-xs"
            >
              <Github className="h-3 w-3 mr-1" />
              View Repo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="bg-gray-700/30 border-gray-600/50 text-white hover:bg-gray-600/50 text-xs"
            >
              <Copy className="h-3 w-3 mr-1" />
              {copied ? "Copied!" : "Copy"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="bg-gradient-to-r from-gray-700/30 to-gray-600/30 border-gray-500/50 text-gray-200 hover:from-gray-600/50 hover:to-gray-500/50 text-xs"
            >
              <Download className="h-3 w-3 mr-1" />
              Download
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-700/30 border border-gray-600/30">
            <TabsTrigger
              value="preview"
              className="flex items-center gap-1 data-[state=active]:bg-gray-600/50 data-[state=active]:text-white text-gray-300"
            >
              <Eye className="h-3 w-3" />
              Preview
            </TabsTrigger>
            <TabsTrigger
              value="markdown"
              className="flex items-center gap-1 data-[state=active]:bg-gray-600/50 data-[state=active]:text-white text-gray-300"
            >
              <Code className="h-3 w-3" />
              Markdown
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="mt-6">
            <div
              className="prose prose-sm max-w-none bg-gradient-to-br from-gray-900/50 to-gray-800/50 p-6 rounded-lg border border-gray-600/30 max-h-[600px] overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
            />
          </TabsContent>

          <TabsContent value="markdown" className="mt-6">
            <pre className="bg-gray-900/50 border border-gray-600/30 p-6 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap text-green-300 max-h-[600px] overflow-y-auto">
              {content}
            </pre>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
