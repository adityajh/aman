# Logo assets

**The mark is three horizontal bars, thickening as they descend.** A hairline on top is
the surface. Two solid blocks below are the depth.

Say "surface", never "waterline". The brand uses depth and never water.

## Single tone, always

Every bar is the same colour. **Thickness carries the whole idea, tone carries none of it.**
This is deliberate: a three-tone version was tested and the top hairline measured 2.16:1
on paper, too faint to survive at small sizes. Single tone means the mark is structurally
identical in every context, and it can never fail contrast.

| File | Colour | Contrast | Use |
|---|---|---|---|
| `lockup.svg` | `#0B4F43` | 9.1:1 on paper | Primary. Mark plus wordmark. Outline the text before sending outside |
| `mark-teal.svg` | `#0B4F43` | 9.1:1 on paper | The mark on light surfaces |
| `mark-ink.svg` | `#14181C` | 17.1:1 on paper | One colour. Print, stamps, fax, embroidery |
| `mark-reversed.svg` | `#5FC3AE` | 8.4:1 on dark | Dark surfaces |
| `favicon-16.svg` | `#0B4F43` | | Bars thickened to 5/10/13 so the hairline holds at 16px |

## Geometry, fixed

- 64 unit grid. Bars at `x=10`, width `44`, corner radius `2`.
- Heights **4, 9, 12** at `y=13, 24, 39`. Vertical span centred on 32.
- Gaps tighten going down, 7 then 6. Compression reads as depth.
- **Never three equal bars.** That is the menu icon, and the weight contrast is the only
  thing preventing it.
- **Never vary the widths.** Bars of differing length off a shared edge encode magnitude,
  which reads as a bar chart, which is the analytics territory the positioning attacks.

## Use

Wordmark leads everywhere it fits: site header, invoice footer, the Outcome Report, email.
The mark appears only where a wordmark cannot go: favicon, app icon, the corner of a PDF.
Never place mark and wordmark twice on the same surface.
