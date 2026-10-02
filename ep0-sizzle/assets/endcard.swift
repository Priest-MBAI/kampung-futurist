// Renders the transparent 1920x1080 end-card overlay: swift assets/endcard.swift assets/endcard.png
import AppKit
let W = 1920, H = 1080
let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: W, pixelsHigh: H, bitsPerSample: 8,
    samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
// Soft bottom gradient so white text reads over any background.
NSGradient(starting: NSColor(white: 0, alpha: 0), ending: NSColor(white: 0, alpha: 0.6))!
    .draw(in: NSRect(x: 0, y: 0, width: W, height: 300), angle: -90)
func centered(_ s: String, _ font: NSFont, _ color: NSColor, y: CGFloat) {
    let shadow = NSShadow(); shadow.shadowBlurRadius = 8; shadow.shadowColor = NSColor(white: 0, alpha: 0.5)
    let a = NSAttributedString(string: s, attributes: [.font: font, .foregroundColor: color, .shadow: shadow, .kern: 1.0])
    a.draw(at: NSPoint(x: (CGFloat(W) - a.size().width) / 2, y: y))
}
centered("@kampungfuturist", NSFont.systemFont(ofSize: 72, weight: .bold), .white, y: 110)
centered("AI, tested in the heartlands.", NSFont.systemFont(ofSize: 36, weight: .medium), NSColor(white: 1, alpha: 0.85), y: 62)
NSGraphicsContext.current?.flushGraphics()
try! rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: CommandLine.arguments[1]))
