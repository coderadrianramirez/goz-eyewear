# Static file server for GOZ Eyewear — PowerShell/.NET HttpListener
param([int]$Port = 4200)

$rootPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()

Write-Output "Serving at http://localhost:$Port"
Write-Output "Press Ctrl+C to stop."

$mimeTypes = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "application/javascript"
  ".json" = "application/json"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".svg"  = "image/svg+xml"
  ".ico"  = "image/x-icon"
  ".webp" = "image/webp"
  ".woff2"= "font/woff2"
  ".woff" = "font/woff"
}

try {
  while ($listener.IsListening) {
    $context  = $listener.GetContext()
    $request  = $context.Request
    $response = $context.Response

    $localPath = $request.Url.LocalPath
    if ($localPath -eq "/" -or $localPath -eq "") { $localPath = "/index.html" }

    $filePath = Join-Path $rootPath ($localPath.TrimStart('/').Replace('/', '\'))

    try {
      if (Test-Path $filePath -PathType Leaf) {
        $ext  = [System.IO.Path]::GetExtension($filePath).ToLower()
        $mime = if ($mimeTypes[$ext]) { $mimeTypes[$ext] } else { "application/octet-stream" }

        $fileInfo = New-Object System.IO.FileInfo($filePath)
        $response.StatusCode      = 200
        $response.ContentType     = $mime
        $response.ContentLength64 = $fileInfo.Length

        $fileStream = [System.IO.File]::OpenRead($filePath)
        try { $fileStream.CopyTo($response.OutputStream) }
        finally { $fileStream.Dispose() }

      } else {
        $body = [System.Text.Encoding]::UTF8.GetBytes("404 - Not Found")
        $response.StatusCode      = 404
        $response.ContentType     = "text/plain; charset=utf-8"
        $response.ContentLength64 = [long]$body.Length
        $response.OutputStream.Write($body, 0, $body.Length)
      }
    } catch {
      # Ignore broken pipe / client disconnected
    } finally {
      try { $response.OutputStream.Close() } catch {}
    }
  }
} finally {
  $listener.Stop()
}
