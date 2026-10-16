"""Render continuous MP4 loops from the unchanged eight-frame Milo sprite sheets.

Offline asset tool: Python 3 + numpy + opencv-python + FFmpeg. No runtime dependency.
The original illustration, sprite sheets and posters are never modified.
"""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import argparse, hashlib, json, subprocess
import cv2
import numpy as np

ASSETS = Path(__file__).resolve().parents[1] / 'public/assets/milo'
FPS = 30
SIZE = 512
# Key-pose timing in seconds, including a return to pose zero. Blink poses are short.
TIMING = {
    'idle': [0, 1, 2, 2.13, 2.23, 2.40, 3.2, 4.1, 5],
    'wave': [0, .5, .8, 1.1, 1.4, 1.7, 2, 2.4, 3.2],
    'walk': [0, .2, .4, .6, .8, 1, 1.2, 1.4, 1.6],
    'meal': [0, .65, 1.1, 1.35, 1.8, 2.15, 2.6, 3.1, 3.6],
    'injection': [0, .55, 1.05, 1.5, 2, 2.55, 3.1, 3.6, 4],
    'thinking': [0, .8, 1.5, 2.1, 2.7, 3.3, 3.9, 4.5, 5],
    'comfort': [0, .65, 1.25, 1.85, 2.45, 3.05, 3.65, 4.25, 4.8],
    'celebrate': [0, .5, .85, 1.2, 1.55, 1.9, 2.25, 2.7, 3.2],
}


def sprite_frames(path):
    atlas = cv2.imread(str(path), cv2.IMREAD_UNCHANGED)
    h, w = atlas.shape[:2]
    frames = []
    for index in range(8):
        row, col = divmod(index, 4)
        cell = atlas[row*h//2:(row+1)*h//2, col*w//4:(col+1)*w//4]
        alpha = cell[:, :, 3:4].astype(np.float32) / 255
        matte = cell[:, :, :3] * alpha + np.array([255, 249, 247]) * (1-alpha)
        frames.append(cv2.resize(matte.astype(np.uint8), (SIZE, SIZE), interpolation=cv2.INTER_LANCZOS4))
    return frames


def inbetween_frames(frames):
    # Repeat enough context on each side so the wrap (pose 7 → pose 0) is interpolated too.
    # 2 source poses/sec, 60 output fps: thirty in-between samples per pose interval.
    raw = subprocess.check_output([
        'ffmpeg', '-hide_banner', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'bgr24',
        '-s', f'{SIZE}x{SIZE}', '-r', '2', '-i', 'pipe:0', '-vf',
        'minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1:scd=none,'
        'trim=start=4:end=8,setpts=PTS-STARTPTS', '-an', '-f', 'rawvideo', '-pix_fmt', 'bgr24', 'pipe:1'
    ], input=b''.join(frame.tobytes() for frame in frames*3))
    return np.frombuffer(raw, dtype=np.uint8).reshape(-1, SIZE, SIZE, 3)


def render(name, source):
    cv2.setNumThreads(1)
    sprite = ASSETS / Path(source['sprite']).name
    frames = sprite_frames(sprite)
    continuous = inbetween_frames(frames)
    timings = np.array(TIMING[name])
    count = round(timings[-1] * FPS)
    target = ASSETS / f'{name}-v2.mp4'
    process = subprocess.Popen([
        'ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24',
        '-s', f'{SIZE}x{SIZE}', '-r', str(FPS), '-i', 'pipe:0', '-an', '-c:v', 'libx264',
        '-preset', 'fast', '-tune', 'animation', '-crf', '18', '-pix_fmt', 'yuv420p', '-g', str(FPS), '-bf', '0',
        '-movflags', '+faststart', str(target)
    ], stdin=subprocess.PIPE)
    try:
        for index in range(count):
            time = index / FPS
            segment = min(7, int(np.searchsorted(timings, time, side='right') - 1))
            progress = (time - timings[segment]) / (timings[segment+1] - timings[segment])
            if name != 'walk':
                progress = progress*progress*(3-2*progress)
            sample = round((segment+progress) * 30) % len(continuous)
            frame = continuous[sample]
            process.stdin.write(frame.tobytes())
    finally:
        process.stdin.close()
    if process.wait() != 0:
        raise RuntimeError(f'Encoding failed: {name}')
    cap = cv2.VideoCapture(str(target))
    decoded = []
    while True:
        ok, frame = cap.read()
        if not ok:
            break
        decoded.append(frame.astype(np.float32))
    cap.release()
    diffs = np.array([np.abs(b-a).mean() for a, b in zip(decoded, decoded[1:])])
    result = dict(source, video=f'/assets/milo/{name}-v2.mp4', videoFps=FPS, durationSeconds=count/FPS, keyPoseTimes=TIMING[name], spriteSha256=hashlib.sha256(sprite.read_bytes()).hexdigest())
    quality = {'frames':len(decoded), 'heldFrames':int((diffs<.05).sum()), 'maxJump':round(float(diffs.max()), 3), 'seamJump':round(float(np.abs(decoded[-1]-decoded[0]).mean()), 3), 'bytes':target.stat().st_size}
    print(name, json.dumps(quality), flush=True)
    return name, result, quality


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--states', nargs='*', choices=list(TIMING), default=list(TIMING))
    parser.add_argument('--report', type=Path)
    args = parser.parse_args()
    sources = json.loads((ASSETS / 'manifest-v1.json').read_text())
    with ThreadPoolExecutor(max_workers=2) as pool:
        rendered = list(pool.map(lambda name: render(name, sources[name]), args.states))
    if len(rendered) == len(TIMING):
        (ASSETS / 'manifest-v2.json').write_text(json.dumps({name: media for name, media, quality in rendered}, indent=2)+'\n')
    if args.report:
        args.report.write_text(json.dumps({name: quality for name, media, quality in rendered}, indent=2)+'\n')
