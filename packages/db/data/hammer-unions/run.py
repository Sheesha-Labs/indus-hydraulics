#!/usr/bin/env python3
"""
Generate the hammer union renders.

Same harness as the blog, service-case and metric-elbow sprints: `codex exec`
driving `$imagegen`, three attempts per image, skipping anything already on
disk so a re-run finishes a partial batch. Output is `<SKU>.png`, which is what
`attach-renders-by-sku.ts` keys on.

Three live catalogue renders are passed as references to hold the house style.
They are OUR renders, not a supplier's photographs — see the note at the top of
briefs.py.

Usage:
    python3 run.py [--only=SKU] [--dry-run]
"""
import json
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).parent
OUT = Path.home() / 'Documents/Indus Hydraulics Website/Product Images/Hammer Unions'
REFS = OUT / 'refs'
ATTEMPTS = 3
CODEX = str(Path.home() / '.local/bin/codex')


def main() -> None:
    dry = '--dry-run' in sys.argv
    only = next((a.split('=', 1)[1] for a in sys.argv if a.startswith('--only=')), None)

    scenes = json.loads((HERE / 'scenes.json').read_text())
    if only:
        scenes = [s for s in scenes if s['sku'] == only]
    refs = sorted(p for p in REFS.glob('*.png'))
    OUT.mkdir(parents=True, exist_ok=True)

    done, made, failed = [], [], []
    for i, s in enumerate(scenes, 1):
        target = OUT / f"{s['sku']}.png"
        if target.exists() and target.stat().st_size > 10_000:
            done.append(s['sku'])
            continue

        ref_line = ''
        if refs:
            ref_line = ('\nMatch the finish, lighting, background and framing of these existing '
                        'catalogue renders exactly:\n' +
                        '\n'.join(f'  {p}' for p in refs) + '\n')

        prompt = (
            f"{s['prompt']}{ref_line}\n"
            f"Generate this image with the imagegen tool at 1536x1024 or square, then save the "
            f"result to exactly this path, overwriting if it exists:\n"
            f"  {target}\n"
            f"Do not save it anywhere else and do not rename it. Reply with only the word DONE "
            f"once the file exists at that path."
        )

        print(f"[{i}/{len(scenes)}] {s['sku']}", flush=True)
        if dry:
            continue

        ok = False
        for attempt in range(1, ATTEMPTS + 1):
            try:
                r = subprocess.run(
                    [CODEX, 'exec', '--skip-git-repo-check', '--dangerously-bypass-approvals-and-sandbox', prompt],
                    cwd=str(OUT), capture_output=True, text=True, timeout=900,
                )
            except subprocess.TimeoutExpired:
                print(f"    attempt {attempt}: timed out", flush=True)
                continue
            if target.exists() and target.stat().st_size > 10_000:
                ok = True
                break
            tail = (r.stdout or r.stderr or '').strip().splitlines()[-3:]
            print(f"    attempt {attempt}: no file. {' | '.join(tail)}", flush=True)
        (made if ok else failed).append(s['sku'])

    print(f"\n{len(done)} already on disk, {len(made)} generated, {len(failed)} failed")
    for f in failed:
        print(f"  ! {f}")


if __name__ == '__main__':
    main()
