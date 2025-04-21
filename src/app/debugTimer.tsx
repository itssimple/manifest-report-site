import { JSX } from "react";

interface DebugTimerData {
    start: number;
    end?: number;
    duration?: number;
    label: string;
}

const TIMINGLOG = process.env.TIMINGLOG === "true";

export class DebugTimer {
    private timers: Map<string, DebugTimerData> = new Map();
    private labelCounts: Map<string, number> = new Map();

    start(label: string): string {
        if (!TIMINGLOG) return label;
        const count = this.labelCounts.get(label) || 0;
        this.labelCounts.set(label, count + 1);
        const timerId = `${label}-${count}`;
        this.timers.set(timerId, { start: performance.now(), label });
        return timerId;
    }

    stop(label: string): void {
        if (!TIMINGLOG) return;
        const timerData = this.timers.get(label);
        if (timerData) {
            timerData.end = performance.now();
            timerData.duration = timerData.end - timerData.start;
            this.timers.set(label, timerData);
        }
    }

    clear(label: string): void {
        if (!TIMINGLOG) return;
        this.timers.delete(label);
    }

    clearAll(): void {
        if (!TIMINGLOG) return;
        this.timers.clear();
        this.labelCounts.clear();
    }

    toElements(): JSX.Element {
        if (!TIMINGLOG) return <></>;
        const elements: JSX.Element[] = [];
        this.timers.forEach((timerData, timerId) => {
            const { start, end, duration, label } = timerData;
            const count = this.labelCounts.get(label) || 0;
            elements.push(
                <div key={timerId} className="debug-timer">
                    <span>{label}</span>: {count} - {start.toFixed(2)}ms to{" "}
                    {end?.toFixed(2)}ms ({duration?.toFixed(2)}ms)
                </div>
            );
        });

        this.clearAll();

        return <>{elements}</>;
    }
}
