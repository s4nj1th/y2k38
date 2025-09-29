import { useEffect, useRef, useState } from "react";

const themes = {
    green: {
        background: "#1F2420",
        elements: "#B0D270",
        shadow: "#586342",
        scanline: "rgba(87, 199, 92, 0.1)",
    },
    blue: {
        background: "#20242F",
        elements: "#70D2E0",
        shadow: "#426358",
        scanline: "rgba(88, 199, 218, 0.1)",
    },
    purple: {
        background: "#24202F",
        elements: "#D270E0",
        shadow: "#634258",
        scanline: "rgba(199, 88, 218, 0.1)",
    },
    orange: {
        background: "#2F2420",
        elements: "#E0A070",
        shadow: "#635842",
        scanline: "rgba(218, 140, 88, 0.1)",
    },
};

export default function Game() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [theme, setTheme] = useState("green");
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [highScore, setHighScore] = useState<number>(() => {
        const saved = localStorage.getItem("breakoutHighScore");
        return saved ? parseInt(saved, 10) : 0;
    });
    const [gameOver, setGameOver] = useState(false);
    const [gamePaused, setGamePaused] = useState(false);
    const [showWhy, setShowWhy] = useState(false);
    const handleRestart = () => {
        setScore(0);
        setLives(3);
        setGameOver(false);
    };

    useEffect(() => {
        if (gamePaused || gameOver) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const logicalWidth = 800;
        const logicalHeight = 600;
        let scale = 1;
        const pixelSize = 10;
        const targetDate = new Date("2038-01-19T03:14:07Z");
        const ballSpeed = 4;

        const digitPatterns: { [key: string]: number[][] } = {
            "0": [
                [0, 1, 1, 1, 0],
                [1, 0, 0, 0, 1],
                [1, 0, 0, 0, 1],
                [1, 0, 0, 0, 1],
                [1, 0, 0, 0, 1],
                [1, 0, 0, 0, 1],
                [0, 1, 1, 1, 0],
            ],
            "1": [
                [0, 0, 1, 0, 0],
                [0, 1, 1, 0, 0],
                [0, 0, 1, 0, 0],
                [0, 0, 1, 0, 0],
                [0, 0, 1, 0, 0],
                [0, 0, 1, 0, 0],
                [0, 1, 1, 1, 0],
            ],
            "2": [
                [0, 1, 1, 1, 0],
                [1, 0, 0, 0, 1],
                [0, 0, 0, 0, 1],
                [0, 0, 1, 1, 0],
                [0, 1, 0, 0, 0],
                [1, 0, 0, 0, 1],
                [0, 1, 1, 1, 0],
            ],
            "3": [
                [0, 1, 1, 1, 0],
                [1, 0, 0, 0, 1],
                [0, 0, 0, 0, 1],
                [0, 1, 1, 1, 0],
                [0, 0, 0, 0, 1],
                [1, 0, 0, 0, 1],
                [0, 1, 1, 1, 0],
            ],
            "4": [
                [0, 0, 0, 1, 0],
                [0, 0, 1, 1, 0],
                [0, 1, 0, 1, 0],
                [1, 0, 0, 1, 0],
                [1, 1, 1, 1, 1],
                [0, 0, 0, 1, 0],
                [0, 0, 0, 1, 0],
            ],
            "5": [
                [0, 1, 1, 1, 0],
                [1, 0, 0, 0, 0],
                [1, 0, 0, 0, 0],
                [0, 1, 1, 1, 0],
                [0, 0, 0, 0, 1],
                [1, 0, 0, 0, 1],
                [0, 1, 1, 1, 0],
            ],
            "6": [
                [0, 1, 1, 1, 0],
                [1, 0, 0, 0, 0],
                [1, 0, 0, 0, 0],
                [0, 1, 1, 1, 0],
                [1, 0, 0, 0, 1],
                [1, 0, 0, 0, 1],
                [0, 1, 1, 1, 0],
            ],
            "7": [
                [0, 1, 1, 1, 0],
                [1, 0, 0, 0, 1],
                [0, 0, 0, 0, 1],
                [0, 0, 0, 1, 0],
                [0, 0, 1, 0, 0],
                [0, 0, 1, 0, 0],
                [0, 0, 1, 0, 0],
            ],
            "8": [
                [0, 1, 1, 1, 0],
                [1, 0, 0, 0, 1],
                [1, 0, 0, 0, 1],
                [0, 1, 1, 1, 0],
                [1, 0, 0, 0, 1],
                [1, 0, 0, 0, 1],
                [0, 1, 1, 1, 0],
            ],
            "9": [
                [0, 1, 1, 1, 0],
                [1, 0, 0, 0, 1],
                [1, 0, 0, 0, 1],
                [0, 1, 1, 1, 1],
                [0, 0, 0, 0, 1],
                [0, 0, 0, 0, 1],
                [0, 1, 1, 1, 0],
            ],
        };
        const colonPattern = [
            [0, 0, 0, 0, 0],
            [0, 0, 1, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 1, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
        ];

        const spacing = 60;
        const characterWidth = 50;
        const totalSpan = (13 - 1) * spacing + characterWidth;
        const startX = (logicalWidth - totalSpan) / 2;

        type Character = {
            index: number;
            type: "colon" | "digit";
            value: string;
            pattern: number[][];
            hit: boolean[][];
            x: number;
        };
        const characters: Character[] = Array(13)
            .fill(null)
            .map((_, i) => ({
                index: i,
                type: [4, 7, 10].includes(i) ? "colon" : "digit",
                value: "",
                pattern: [],
                hit: Array(7)
                    .fill(false)
                    .map(() => Array(5).fill(false)),
                x: startX + i * spacing,
            }));

        let platform = { x: 350, y: 550, width: 100, height: 10, velocity: 0 };
        let ball = {
            x: 400,
            y: 300,
            radius: 5,
            dx: ballSpeed,
            dy: -ballSpeed,
            speed: ballSpeed,
        };

        let leftPressed = false;
        let rightPressed = false;
        let lastRowRevealTime = Date.now();

        function resizeCanvas() {
            const viewportWidth = window.innerWidth;
            let width, height;
            if (viewportWidth <= 700) {
                width = 400;
                height = 300;
                scale = 0.5;
            } else if (viewportWidth <= 1000) {
                width = 600;
                height = 450;
                scale = 0.75;
            } else if (viewportWidth <= 1500) {
                width = 800;
                height = 600;
                scale = 1;
            } else {
                width = 1200;
                height = 900;
                scale = 1.5;
            }
            if (canvas) {
                canvas.width = width;
                canvas.height = height;
            }
        }

        function getPattern(value: string): number[][] {
            return value === ":" ? colonPattern : digitPatterns[value];
        }

        function updateCountdown() {
            const now = new Date();
            const diff = targetDate.getTime() - now.getTime();
            const resetHits = (idxs: number[]) =>
                idxs.forEach(
                    (i: number) =>
                        (characters[i].hit = Array(7)
                            .fill(false)
                            .map(() => Array(5).fill(false)))
                );
            if (diff <= 0) {
                characters.forEach((char) => {
                    char.value = "0";
                    char.pattern = digitPatterns["0"];
                    resetHits([char.index]);
                });
            } else {
                const totalSeconds = Math.floor(diff / 1000);
                const days = Math.floor(totalSeconds / (3600 * 24));
                const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                const seconds = totalSeconds % 60;
                const daysStr = String(days).padStart(4, "0");
                const hoursStr = String(hours).padStart(2, "0");
                const minutesStr = String(minutes).padStart(2, "0");
                const secondsStr = String(seconds).padStart(2, "0");
                const newValues = [
                    daysStr[0],
                    daysStr[1],
                    daysStr[2],
                    daysStr[3],
                    ":",
                    hoursStr[0],
                    hoursStr[1],
                    ":",
                    minutesStr[0],
                    minutesStr[1],
                    ":",
                    secondsStr[0],
                    secondsStr[1],
                ];
                characters.forEach((char, i) => {
                    if (newValues[i] !== char.value) {
                        char.value = newValues[i];
                        char.pattern = getPattern(char.value);
                        char.hit = Array(7)
                            .fill(false)
                            .map(() => Array(5).fill(false));
                    }
                });
            }
        }

        function normalizeSpeed() {
            const currentSpeed = Math.sqrt(ball.dx ** 2 + ball.dy ** 2);
            if (currentSpeed) {
                ball.dx = (ball.dx / currentSpeed) * ball.speed;
                ball.dy = (ball.dy / currentSpeed) * ball.speed;
            }
        }

        function update() {
            platform.velocity = leftPressed ? -5 : rightPressed ? 5 : 0;
            platform.x += platform.velocity;
            if (platform.x < 0) platform.x = 0;
            if (platform.x + platform.width > logicalWidth)
                platform.x = logicalWidth - platform.width;

            ball.x += ball.dx;
            ball.y += ball.dy;

            if (
                ball.x - ball.radius < 0 ||
                ball.x + ball.radius > logicalWidth
            ) {
                ball.dx = -ball.dx;
                normalizeSpeed();
            }
            if (ball.y - ball.radius < 0) {
                ball.dy = -ball.dy;
                normalizeSpeed();
            }

            if (
                ball.y + ball.radius > platform.y &&
                ball.x > platform.x &&
                ball.x < platform.x + platform.width
            ) {
                const paddleCenter = platform.x + platform.width / 2;
                const relative = (ball.x - paddleCenter) / (platform.width / 2);
                const maxAngle = Math.PI / 3;
                const bounceAngle = relative * maxAngle;
                ball.dx = ball.speed * Math.sin(bounceAngle);
                ball.dy = -ball.speed * Math.cos(bounceAngle);
                normalizeSpeed();
            }

            characters.forEach((char) => {
                char.pattern.forEach((row: number[], r: number) => {
                    row.forEach((cell: number, c: number) => {
                        if (cell && !char.hit[r][c]) {
                            const px = char.x + c * pixelSize;
                            const py = 10 + r * pixelSize;
                            if (
                                ball.x + ball.radius > px &&
                                ball.x - ball.radius < px + pixelSize &&
                                ball.y + ball.radius > py &&
                                ball.y - ball.radius < py + pixelSize
                            ) {
                                char.hit[r][c] = true;
                                setScore((prev) => {
                                    const newScore = prev + 10;
                                    if (newScore > highScore) {
                                        setHighScore(newScore);
                                        localStorage.setItem(
                                            "breakoutHighScore",
                                            newScore.toString()
                                        );
                                    }
                                    return newScore;
                                });
                                ball.dy = -ball.dy;
                                normalizeSpeed();
                            }
                        }
                    });
                });
            });

            if (canvas && ball.y + ball.radius > canvas.height / scale) {
                setLives((prev) => {
                    const next = prev - 1;
                    if (next <= 0) {
                        setGameOver(true);
                        return 0;
                    } else {
                        ball.x = logicalWidth / 2;
                        ball.y = logicalHeight / 2;
                        ball.dx = ball.speed;
                        ball.dy = -ball.speed;
                        return next;
                    }
                });
            }

            if (Date.now() - lastRowRevealTime >= 60000) {
                characters.forEach((char) => {
                    for (let r = 0; r < 7; r++) {
                        if (char.hit[r].some((h) => h)) {
                            char.hit[r] = [false, false, false, false, false];
                            break;
                        }
                    }
                });
                lastRowRevealTime = Date.now();
            }
        }

        function draw() {
            if (!canvas || !ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const current = themes[theme as keyof typeof themes];
            ctx.fillStyle = current.elements;
            ctx.shadowColor = current.shadow;
            ctx.shadowBlur = 6;
            ctx.shadowOffsetX = 5;
            ctx.shadowOffsetY = 5;
            const pixelScaled = pixelSize * scale;

            characters.forEach((char) => {
                const charX = char.x * scale;
                const charY = 10 * scale;
                char.pattern.forEach((row: number[], r: number) => {
                    row.forEach((cell: number, c: number) => {
                        if (cell && !char.hit[r][c]) {
                            ctx.fillRect(
                                charX + c * pixelScaled,
                                charY + r * pixelScaled,
                                pixelScaled,
                                pixelScaled
                            );
                        }
                    });
                });
            });

            ctx.fillRect(
                platform.x * scale,
                platform.y * scale,
                platform.width * scale,
                platform.height * scale
            );
            ctx.fillRect(
                (ball.x - ball.radius) * scale,
                (ball.y - ball.radius) * scale,
                ball.radius * 2 * scale,
                ball.radius * 2 * scale
            );
        }

        function loop() {
            if (gameOver || gamePaused) return;
            update();
            draw();
            requestAnimationFrame(loop);
        }

        function keyHandler(e: KeyboardEvent) {
            if (e.type === "keydown") {
                if (e.key === "ArrowLeft") leftPressed = true;
                if (e.key === "ArrowRight") rightPressed = true;
            } else {
                if (e.key === "ArrowLeft") leftPressed = false;
                if (e.key === "ArrowRight") rightPressed = false;
            }
        }

        window.addEventListener("keydown", keyHandler);
        window.addEventListener("keyup", keyHandler);
        window.addEventListener("resize", resizeCanvas);
        resizeCanvas();
        updateCountdown();
        const countdownInterval = setInterval(updateCountdown, 1000);
        loop();

        return () => {
            clearInterval(countdownInterval);
            window.removeEventListener("keydown", keyHandler);
            window.removeEventListener("keyup", keyHandler);
            window.removeEventListener("resize", resizeCanvas);
        };
    }, [theme]);

    return (
        <div
            style={{
                position: "relative",
                height: "100vh",
                width: "100vw",
                backgroundColor:
                    themes[theme as keyof typeof themes].background,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            {gameOver ? (
                <div
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        color: "white",
                        textAlign: "center",
                        textShadow: "0 0 10px black",
                    }}
                >
                    <div
                        style={{
                            fontSize: "2rem",
                            fontWeight: "bold",
                            marginBottom: "20px",
                        }}
                    >
                        GAME OVER
                    </div>
                    <button
                        onClick={handleRestart}
                        style={{
                            padding: "5px 10px",
                            fontSize: "1rem",
                            backgroundColor:
                                themes[theme as keyof typeof themes].elements,
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                        }}
                    >
                        <svg
                            fill={themes[theme as keyof typeof themes].background}
                            width="64px"
                            height="64px"
                            viewBox="-7.5 0 32 32"
                            version="1.1"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                            <g
                                id="SVGRepo_tracerCarrier"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            ></g>
                            <g id="SVGRepo_iconCarrier">
                                {" "}
                                <title>restart</title>{" "}
                                <path d="M15.88 13.84c-1.68-3.48-5.44-5.24-9.040-4.6l0.96-1.8c0.24-0.4 0.080-0.92-0.32-1.12-0.4-0.24-0.92-0.080-1.12 0.32l-1.96 3.64c0 0-0.44 0.72 0.24 1.040l3.64 1.96c0.12 0.080 0.28 0.12 0.4 0.12 0.28 0 0.6-0.16 0.72-0.44 0.24-0.4 0.080-0.92-0.32-1.12l-1.88-1.040c2.84-0.48 5.8 0.96 7.12 3.68 1.6 3.32 0.2 7.32-3.12 8.88-1.6 0.76-3.4 0.88-5.080 0.28s-3.040-1.8-3.8-3.4c-0.76-1.6-0.88-3.4-0.28-5.080 0.16-0.44-0.080-0.92-0.52-1.080-0.4-0.080-0.88 0.16-1.040 0.6-0.72 2.12-0.6 4.36 0.36 6.36s2.64 3.52 4.76 4.28c0.92 0.32 1.84 0.48 2.76 0.48 1.24 0 2.48-0.28 3.6-0.84 4.16-2 5.92-7 3.92-11.12z"></path>{" "}
                            </g>
                        </svg>
                    </button>
                </div>
            ) : (
                <>
                    <div
                        style={{
                            position: "absolute",
                            top: 10,
                            left: 10,
                            color: themes[theme as keyof typeof themes]
                                .elements,
                            fontSize: "1.2rem",
                            userSelect: "none",
                        }}
                    >
                        <div>Score: {score}</div>
                        <div>High: {highScore}</div>
                        <div>Lives: {lives}</div>
                    </div>
                    <canvas
                        ref={canvasRef}
                        style={{
                            border: `2px solid ${
                                themes[theme as keyof typeof themes].elements
                            }`,
                            borderRadius: "10px",
                            boxShadow: "inset 0 -10px 100px rgb(0,0,0)",
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            top: 10,
                            right: 10,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            gap: "10px",
                        }}
                    >
                        <div style={{ display: "flex", gap: "10px" }}>
                            {Object.keys(themes).map((name) => (
                                <div
                                    key={name}
                                    onClick={() => setTheme(name)}
                                    style={{
                                        cursor: "pointer",
                                        height: "1rem",
                                        width: "1rem",
                                        borderRadius: "50%",
                                        backgroundColor:
                                            themes[name as keyof typeof themes]
                                                .elements,
                                        border:
                                            theme === name
                                                ? "2px solid white"
                                                : "none",
                                    }}
                                />
                            ))}
                        </div>
                        <button
                            onClick={() => {
                                setGamePaused(true);
                                setShowWhy(true);
                            }}
                            style={{
                                marginTop: "10px",
                                padding: "4px 12px",
                                fontSize: "1rem",
                                borderRadius: "6px",
                                border: "none",
                                background: "transparent",
                                color: themes[theme as keyof typeof themes].elements,
                                cursor: "pointer",
                                fontWeight: "bold",
                                textDecoration: "underline",
                            }}
                        >
                            why?
                        </button>
                    </div>
                    {showWhy && (
                        <div
                            style={{
                                position: "fixed",
                                top: 0,
                                left: 0,
                                width: "100vw",
                                height: "100vh",
                                background: "rgba(0,0,0,0.7)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                zIndex: 1000,
                            }}
                        >
                            <div
                                style={{
                                    background: themes[theme as keyof typeof themes].background,
                                    color: themes[theme as keyof typeof themes].elements,
                                    padding: "2rem 2.5rem",
                                    borderRadius: "16px",
                                    boxShadow: "0 0 30px #000",
                                    textAlign: "center",
                                    fontFamily: "monospace",
                                    fontSize: "1.2rem",
                                    maxWidth: "90vw",
                                }}
                            >
                                <div style={{ marginBottom: "1.5rem", fontWeight: "bold", fontSize: "1.5rem" }}>
                                    Why this game?
                                </div>
                                <div style={{ marginBottom: "2rem" }}>
                                    This game is a countdown to the Y2K38 bug, where 32-bit systems will overflow.
                                    It's a fun way to raise awareness about the issue and encourage people to think about
                                    the importance of using 64-bit systems.
                                </div>
                                <button
                                    onClick={() => {
                                        setGamePaused(false);
                                        setShowWhy(false);
                                    }}
                                    style={{
                                        padding: "8px 24px",
                                        fontSize: "1rem",
                                        borderRadius: "8px",
                                        border: "none",
                                        background: themes[theme as keyof typeof themes].elements,
                                        color: themes[theme as keyof typeof themes].background,
                                        cursor: "pointer",
                                        fontFamily: "monospace",
                                        fontWeight: "bold",
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
