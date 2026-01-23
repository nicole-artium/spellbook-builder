import type { jsPDF } from 'jspdf'

export function drawDiamond(doc: jsPDF, x: number, y: number, size: number): void {
  const half = size / 2
  doc.setFillColor(0, 0, 0)
  doc.triangle(x + half, y, x + size, y + half, x, y + half, 'F')
  doc.triangle(x + size, y + half, x + half, y + size, x, y + half, 'F')
}

export function drawSquare(doc: jsPDF, x: number, y: number, size: number): void {
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.25)
  doc.rect(x, y, size, size, 'S')
}
