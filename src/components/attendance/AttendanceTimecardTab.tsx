// components/attendance/AttendanceTimecardTab.tsx
"use client";

import React from "react";
import { AttendanceTimeCard } from "@/components/AttendanceTimeCard";

interface AttendanceTimecardTabProps {
  currentStatus: "out" | "in" | "break";
  onClockIn: () => void;
  onClockOut: () => void;
  onBreakStart: () => void;
  onBreakEnd: () => void;
  currentTime: string;
  todayWorkHours: number;
}

export function AttendanceTimecardTab({
  currentStatus,
  onClockIn,
  onClockOut,
  onBreakStart,
  onBreakEnd,
  currentTime,
  todayWorkHours,
}: AttendanceTimecardTabProps) {
  return (
    <section className="space-y-6" aria-label="タイムカード打刻">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          タイムカード
        </h2>
        <p className="text-muted-foreground">
          出勤・退勤・休憩の打刻を行ってください
        </p>
      </div>

      <AttendanceTimeCard
        currentStatus={currentStatus}
        onClockIn={onClockIn}
        onClockOut={onClockOut}
        onBreakStart={onBreakStart}
        onBreakEnd={onBreakEnd}
        currentTime={currentTime}
        todayWorkHours={todayWorkHours}
      />
    </section>
  );
}
