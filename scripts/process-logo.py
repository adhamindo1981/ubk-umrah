import sys
from PIL import Image, ImageEnhance, ImageFilter
from collections import deque

def process_logo(input_path, output_path):
    orig = Image.open(input_path).convert('RGBA')
    w, h = orig.size
    pixels = orig.load()

    # 1. Identify Kaaba region that must retain solid white walls
    # Kaaba coordinates in 709x709:
    # Top ridge: (350, 233)
    # Left edge: x=248 to 350, y=260 to 425
    # Right edge: x=350 to 452, y=270 to 425
    kaaba_poly = [
        (350, 230),
        (454, 272),
        (454, 420),
        (350, 442),
        (248, 420),
        (248, 258)
    ]

    mask_kaaba = Image.new('L', (w, h), 0)
    from PIL import ImageDraw
    draw = ImageDraw.Draw(mask_kaaba)
    draw.polygon(kaaba_poly, fill=255)
    kaaba_mask_pixels = mask_kaaba.load()

    # 2. Perform exterior flood fill for white background
    # Start from borders
    bg_visited = set()
    queue = deque()

    # Add all border pixels that are near white
    for x in range(w):
        for y in [0, h - 1]:
            r, g, b, a = pixels[x, y]
            if min(r, g, b) >= 240:
                bg_visited.add((x, y))
                queue.append((x, y))
    for y in range(h):
        for x in [0, w - 1]:
            r, g, b, a = pixels[x, y]
            if min(r, g, b) >= 240 and (x, y) not in bg_visited:
                bg_visited.add((x, y))
                queue.append((x, y))

    # Also add interior negative spaces:
    # - Between outer green arch and inner gold arch: e.g. (350, 100)
    # - Above Kaaba roof under inner arch: e.g. (350, 180)
    # - Inside loop of B: check coordinates around x=340..370, y=550..650
    # Let's check test points:
    sample_negative_points = [
        (350, 105), # Gap between green and gold arches
        (350, 180), # Gap between gold arch and Kaaba roof
        (260, 520), # Between U and B
        (420, 520), # Between B and K
    ]
    for pt in sample_negative_points:
        if 0 <= pt[0] < w and 0 <= pt[1] < h:
            r, g, b, a = pixels[pt[0], pt[1]]
            if min(r, g, b) >= 240 and pt not in bg_visited:
                bg_visited.add(pt)
                queue.append(pt)

    # Flood fill
    while queue:
        x, y = queue.popleft()
        for dx, dy in [(-1,0), (1,0), (0,-1), (0,1)]:
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in bg_visited:
                # Do NOT cross into the protected Kaaba body if it is white wall!
                if kaaba_mask_pixels[nx, ny] > 0:
                    continue
                r, g, b, a = pixels[nx, ny]
                if min(r, g, b) >= 240:
                    bg_visited.add((nx, ny))
                    queue.append((nx, ny))

    # Also flood fill any remaining enclosed near-white pockets outside the Kaaba
    # (e.g. inside letters 'B', 'A', 'R', etc.)
    for y in range(h):
        for x in range(w):
            if kaaba_mask_pixels[x, y] == 0:
                r, g, b, a = pixels[x, y]
                if min(r, g, b) >= 245 and (x, y) not in bg_visited:
                    # Check if this point is white pocket (like inside B)
                    bg_visited.add((x, y))
                    sub_q = deque([(x, y)])
                    while sub_q:
                        cx, cy = sub_q.popleft()
                        for dx, dy in [(-1,0), (1,0), (0,-1), (0,1)]:
                            nx, ny = cx + dx, cy + dy
                            if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in bg_visited:
                                if kaaba_mask_pixels[nx, ny] == 0:
                                    nr, ng, nb, _ = pixels[nx, ny]
                                    if min(nr, ng, nb) >= 240:
                                        bg_visited.add((nx, ny))
                                        sub_q.append((nx, ny))

    # 3. Create transparent image with smooth anti-aliased edge blending
    out_img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    out_pixels = out_img.load()

    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if (x, y) in bg_visited:
                # Completely transparent
                out_pixels[x, y] = (r, g, b, 0)
            elif kaaba_mask_pixels[x, y] > 0 and min(r, g, b) >= 240:
                # Kaaba white wall: crisp clean pure white
                out_pixels[x, y] = (255, 255, 255, 255)
            else:
                # Check distance to bg_visited to do subtle anti-aliasing
                is_edge = False
                for dx, dy in [(-1,0), (1,0), (0,-1), (0,1)]:
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < w and 0 <= ny < h and (nx, ny) in bg_visited:
                        is_edge = True
                        break
                
                if is_edge and min(r, g, b) > 210:
                    # Edge pixel transitioning into white: calculate alpha
                    brightness = (r + g + b) / 3.0
                    alpha = int(max(0, min(255, (255 - brightness) * 4.5)))
                    out_pixels[x, y] = (r, g, b, alpha)
                else:
                    out_pixels[x, y] = (r, g, b, 255)

    # 4. Enhance image quality:
    # Upscale 2x using Lanczos high-quality resampling for super-crisp rendering
    target_size = (w * 2, h * 2) # 1418 x 1418
    upscaled = out_img.resize(target_size, Image.Resampling.LANCZOS)

    # Subtle sharpness enhancement to make 3D gold embossing pop
    sharpener = ImageEnhance.Sharpness(upscaled)
    enhanced = sharpener.enhance(1.2)

    # Subtle contrast enhancement
    contrast = ImageEnhance.Contrast(enhanced)
    enhanced = contrast.enhance(1.05)

    # Save outputs
    enhanced.save(output_path, format='PNG', optimize=True)
    print(f'Enhanced transparent logo saved to {output_path} (Size: {target_size})')

if __name__ == '__main__':
    inp = r'C:/Users/adham/.gemini/antigravity/brain/4926335e-0172-4102-95b4-8711aa575e17/.user_uploaded/media_1790861863966.png'
    out = 'public/images/logo.png'
    process_logo(inp, out)
