Add-Type -AssemblyName System.IO.Compression.FileSystem
$filePath = Resolve-Path "..\Ujian Tengah Semester.docx"
$fileStream = [System.IO.File]::Open($filePath, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite)
$zip = New-Object System.IO.Compression.ZipArchive($fileStream, [System.IO.Compression.ZipArchiveMode]::Read)
$entry = $zip.GetEntry("word/document.xml")
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream)
$xml = $reader.ReadToEnd()
$reader.Close()
$stream.Close()
$zip.Dispose()
$fileStream.Close()

[xml]$doc = $xml
$ns = New-Object System.Xml.XmlNamespaceManager($doc.NameTable)
$ns.AddNamespace("w", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")
$paragraphs = $doc.SelectNodes("//w:p", $ns)
$output = foreach ($p in $paragraphs) {
    $text = ($p.SelectNodes(".//w:t", $ns) | ForEach-Object { $_.InnerText }) -join ""
    if ($text.Trim()) { $text }
}
$output | Out-File -FilePath "soal_uts.txt" -Encoding utf8
Write-Output "Extracted soal UTS successfully, lines: $($output.Count)"
