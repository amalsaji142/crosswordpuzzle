import json
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def verify_crossword(data_path):
    with open(data_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    rows = data["rows"]
    cols = data["cols"]
    words = data["words"]

    print(f"Verifying Crossword: '{data['title']}' ({rows}x{cols})")
    assert len(words) == 20, f"Expected exactly 20 words, got {len(words)}"
    
    across_words = [w for w in words if w["direction"] == "across"]
    down_words = [w for w in words if w["direction"] == "down"]
    
    assert len(across_words) == 10, f"Expected 10 across words, got {len(across_words)}"
    assert len(down_words) == 10, f"Expected 10 down words, got {len(down_words)}"
    print("  [OK] 20 words total: 10 Across, 10 Down")

    # Verify boundaries and build letter grid
    grid = {}
    word_cells = []

    for item in words:
        w = item["word"]
        r = item["row"]
        c = item["col"]
        direction = item["direction"]
        length = item.get("length", len(w))
        assert length == len(w), f"Length mismatch for word {w}: {length} vs {len(w)}"

        dr, dc = (0, 1) if direction == "across" else (1, 0)
        cells = []
        for i, ch in enumerate(w):
            cr = r + dr * i
            cc = c + dc * i
            assert 0 <= cr < rows, f"Cell ({cr}, {cc}) out of row bounds for word {w}"
            assert 0 <= cc < cols, f"Cell ({cr}, {cc}) out of col bounds for word {w}"
            if (cr, cc) in grid:
                existing = grid[(cr, cc)]
                assert existing == ch, f"Intersection collision at ({cr}, {cc}): '{existing}' vs '{ch}' for word {w}"
            grid[(cr, cc)] = ch
            cells.append((cr, cc))
        word_cells.append(cells)

    print(f"  [OK] All 20 words fit within {rows}x{cols} grid with 0 letter conflicts")
    print(f"  [OK] Total filled letter cells: {len(grid)}")

    # Verify full graph connectivity
    adj = {i: [] for i in range(len(words))}
    for i in range(len(words)):
        set_i = set(word_cells[i])
        for j in range(i + 1, len(words)):
            set_j = set(word_cells[j])
            if set_i & set_j:
                adj[i].append(j)
                adj[j].append(i)

    visited = set()
    def dfs(u):
        visited.add(u)
        for v in adj[u]:
            if v not in visited:
                dfs(v)
    dfs(0)
    assert len(visited) == len(words), f"Disconnected words found! Visited only {len(visited)} of {len(words)}"
    print(f"  [OK] Fully connected crossword graph (all 20 words intersect seamlessly)")

    # Verify standard crossword numbering
    current_num = 1
    for r in range(rows):
        for c in range(cols):
            starts = [w for w in words if w["row"] == r and w["col"] == c]
            if starts:
                for w in starts:
                    assert w["number"] == current_num, f"Number mismatch at ({r},{c}): word {w['word']} has number {w['number']}, expected {current_num}"
                current_num += 1

    print(f"  [OK] Standard crossword numbering strictly verified (Numbers 1 to {current_num - 1})")
    print("ALL VERIFICATIONS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    verify_crossword("C:/Users/thoma/.gemini/antigravity/scratch/cs-crossword-puzzle/puzzle_data.json")
