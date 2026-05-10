const { spawn } = require('child_process');

function buildPowerShellScript(ticket) {
  const payload = JSON.stringify(ticket).replace(/'/g, "''");

  return `
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$ticket = ConvertFrom-Json @'
${payload}
'@

$doc = New-Object System.Drawing.Printing.PrintDocument
$doc.PrintController = New-Object System.Drawing.Printing.StandardPrintController
$doc.DocumentName = 'Queue Ticket'
$doc.DefaultPageSettings.Margins = New-Object System.Drawing.Printing.Margins(0, 0, 0, 0)
$doc.DefaultPageSettings.PaperSize = New-Object System.Drawing.Printing.PaperSize('Receipt', 315, 1200)

if ($ticket.printerName) {
  $doc.PrinterSettings.PrinterName = $ticket.printerName
}

if (-not $doc.PrinterSettings.IsValid) {
  throw 'Printer is not available'
}

$doc.add_PrintPage({
  param($sender, $e)

  $g = $e.Graphics
  $g.PageUnit = [System.Drawing.GraphicsUnit]::Display
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::SingleBitPerPixelGridFit
  $black = [System.Drawing.Brushes]::Black
  $center = New-Object System.Drawing.StringFormat
  $center.Alignment = [System.Drawing.StringAlignment]::Center
  $center.LineAlignment = [System.Drawing.StringAlignment]::Near
  $left = New-Object System.Drawing.StringFormat
  $left.Alignment = [System.Drawing.StringAlignment]::Near
  $left.LineAlignment = [System.Drawing.StringAlignment]::Near

  $titleFont = New-Object System.Drawing.Font('Arial', 14, [System.Drawing.FontStyle]::Bold)
  $codeFont = New-Object System.Drawing.Font('Arial', 20, [System.Drawing.FontStyle]::Bold)
  $labelFont = New-Object System.Drawing.Font('Arial', 10, [System.Drawing.FontStyle]::Bold)
  $rowFont = New-Object System.Drawing.Font('Arial', 10, [System.Drawing.FontStyle]::Regular)
  $noticeFont = New-Object System.Drawing.Font('Arial', 9, [System.Drawing.FontStyle]::Regular)

  $pageWidth = 315
  $leftMargin = 15
  $rightMargin = 300
  $textWidth = $rightMargin - $leftMargin
  $y = 10

  function Draw-LabeledRow {
    param(
      [string]$Label,
      [string]$Value,
      [ref]$YPos
    )

    if ([string]::IsNullOrWhiteSpace($Value)) { return }

    $labelText = "$($Label): "
    $labelSize = $g.MeasureString($labelText, $labelFont)
    $labelRect = [System.Drawing.RectangleF]::new($leftMargin, $YPos.Value, [Math]::Ceiling($labelSize.Width) + 2, 20)
    $valueRect = [System.Drawing.RectangleF]::new($leftMargin + $labelRect.Width, $YPos.Value, $textWidth - $labelRect.Width, 20)

    $g.DrawString($labelText, $labelFont, $black, $labelRect, $left)
    $g.DrawString($Value, $rowFont, $black, $valueRect, $left)

    $YPos.Value += 20
  }

  $g.DrawString('Ticket', $titleFont, $black, [System.Drawing.RectangleF]::new($leftMargin, $y, $textWidth, 28), $center)
  $y += 35

  if ($ticket.ticketCode) {
    $g.DrawString($ticket.ticketCode, $codeFont, $black, [System.Drawing.RectangleF]::new($leftMargin, $y, $textWidth, 36), $center)
  } elseif ($ticket.ticketNumber) {
    $g.DrawString([string]$ticket.ticketNumber, $codeFont, $black, [System.Drawing.RectangleF]::new($leftMargin, $y, $textWidth, 36), $center)
  }

  $y += 46
  $g.DrawLine([System.Drawing.Pens]::Black, $leftMargin, $y, $rightMargin, $y)
  $y += 10

  Draw-LabeledRow -Label 'Service' -Value $ticket.serviceName -YPos ([ref]$y)
  Draw-LabeledRow -Label 'Faculty' -Value $ticket.departmentName -YPos ([ref]$y)
  Draw-LabeledRow -Label 'Date' -Value $ticket.date -YPos ([ref]$y)
  Draw-LabeledRow -Label 'Time' -Value $ticket.time -YPos ([ref]$y)

  $y += 6
  $g.DrawLine([System.Drawing.Pens]::Black, $leftMargin, $y, $rightMargin, $y)
  $y += 10

  $g.DrawString('Please wait to be called', $noticeFont, $black, [System.Drawing.RectangleF]::new(0, $y, $pageWidth, 20), $center)

  $e.HasMorePages = $false
})

$doc.Print()
`;
}

function printTicket(ticket) {
  if (process.platform !== 'win32') {
    return Promise.reject(new Error('Direct printing is supported only on Windows'));
  }

  const script = buildPowerShellScript(ticket);
  const encodedCommand = Buffer.from(script, 'utf16le').toString('base64');

  return new Promise((resolve, reject) => {
    const child = spawn('powershell.exe', [
      '-NoProfile',
      '-ExecutionPolicy', 'Bypass',
      '-EncodedCommand', encodedCommand
    ], {
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stderr = '';

    child.stdout.on('data', () => {});
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(true);
      } else {
        reject(new Error(stderr.trim() || `Print process exited with code ${code}`));
      }
    });
  });
}

module.exports = { printTicket };