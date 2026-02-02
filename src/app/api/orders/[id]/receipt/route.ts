import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"

interface Props {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, { params }: Props) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Autenticação necessária" }, { status: 401 })
    }

    const { id } = await params

    // Allow access for order owner or staff
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    const isStaff = user && !["USER"].includes(user.role)

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true, cpf: true } },
        items: { include: { ebook: { select: { title: true } } } },
        coupon: { select: { code: true } },
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 })
    }

    if (order.userId !== session.user.id && !isStaff) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    if (order.status !== "PAID" && order.status !== "REFUNDED") {
      return NextResponse.json({ error: "Recibo disponível apenas para pedidos pagos" }, { status: 400 })
    }

    // Generate PDF
    const doc = await PDFDocument.create()
    const page = doc.addPage([595, 842]) // A4
    const font = await doc.embedFont(StandardFonts.Helvetica)
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold)
    const { height } = page.getSize()

    let y = height - 60

    // Header
    page.drawText("Fude kotoba", { x: 50, y, font: fontBold, size: 20, color: rgb(0.9, 0.22, 0.27) })
    y -= 20
    page.drawText("Recibo de Compra", { x: 50, y, font, size: 12, color: rgb(0.4, 0.4, 0.4) })

    y -= 40

    // Order info
    page.drawText(`Pedido: #${order.id.slice(0, 8)}`, { x: 50, y, font: fontBold, size: 11 })
    y -= 18
    page.drawText(`Data: ${order.paidAt ? order.paidAt.toLocaleDateString("pt-BR") : order.createdAt.toLocaleDateString("pt-BR")}`, { x: 50, y, font, size: 10 })
    y -= 15
    page.drawText(`Status: ${order.status}`, { x: 50, y, font, size: 10 })
    y -= 15
    page.drawText(`Pagamento: ${order.paymentMethod || "-"}`, { x: 50, y, font, size: 10 })

    y -= 30

    // Customer info
    page.drawText("Cliente", { x: 50, y, font: fontBold, size: 11 })
    y -= 18
    page.drawText(`Nome: ${order.user.name || order.customerName || "-"}`, { x: 50, y, font, size: 10 })
    y -= 15
    page.drawText(`Email: ${order.user.email || order.customerEmail || "-"}`, { x: 50, y, font, size: 10 })
    y -= 15
    page.drawText(`CPF: ${order.customerCpf || order.user.cpf || "-"}`, { x: 50, y, font, size: 10 })

    y -= 30

    // Items table header
    page.drawText("Itens", { x: 50, y, font: fontBold, size: 11 })
    y -= 20

    // Table header line
    page.drawLine({ start: { x: 50, y: y + 5 }, end: { x: 545, y: y + 5 }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) })
    page.drawText("Titulo", { x: 50, y, font: fontBold, size: 9 })
    page.drawText("Preco", { x: 480, y, font: fontBold, size: 9 })
    y -= 5
    page.drawLine({ start: { x: 50, y }, end: { x: 545, y }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) })
    y -= 15

    for (const item of order.items) {
      const title = item.ebook.title.length > 60 ? item.ebook.title.slice(0, 57) + "..." : item.ebook.title
      page.drawText(title, { x: 50, y, font, size: 9 })
      page.drawText(`R$ ${item.price.toFixed(2)}`, { x: 480, y, font, size: 9 })
      y -= 15
    }

    page.drawLine({ start: { x: 50, y: y + 5 }, end: { x: 545, y: y + 5 }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) })
    y -= 10

    // Totals
    if (order.discount > 0) {
      page.drawText(`Desconto${order.coupon ? ` (${order.coupon.code})` : ""}:`, { x: 380, y, font, size: 10 })
      page.drawText(`-R$ ${order.discount.toFixed(2)}`, { x: 480, y, font, size: 10, color: rgb(0, 0.6, 0) })
      y -= 18
    }

    page.drawText("Total:", { x: 380, y, font: fontBold, size: 12 })
    page.drawText(`R$ ${order.total.toFixed(2)}`, { x: 480, y, font: fontBold, size: 12 })

    y -= 60

    // Footer
    page.drawText("Documento gerado automaticamente.", { x: 50, y, font, size: 8, color: rgb(0.6, 0.6, 0.6) })

    const pdfBytes = await doc.save()

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="recibo-${order.id.slice(0, 8)}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Receipt generation error:", error)
    return NextResponse.json({ error: "Erro ao gerar recibo" }, { status: 500 })
  }
}
