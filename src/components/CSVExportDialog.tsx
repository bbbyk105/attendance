// components/CSVExportDialog.tsx
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Download } from "lucide-react";
import { AttendanceRecord, CSVExportOptions } from "@/types/attendance";
import { generateCSV, downloadCSV, generateFilename } from "@/lib/attendance";

interface CSVExportDialogProps {
  records: AttendanceRecord[];
  onExport?: () => void;
}

export const CSVExportDialog: React.FC<CSVExportDialogProps> = ({
  records,
  onExport,
}) => {
  const [exportOptions, setExportOptions] = useState<CSVExportOptions>({
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    includeBreaks: true,
    includeNotes: true,
  });

  const handleExport = () => {
    // 日付でフィルタリング
    const filteredRecords = records.filter((record) => {
      const recordDate = new Date(record.date).toISOString().split("T")[0];
      return (
        recordDate >= exportOptions.startDate &&
        recordDate <= exportOptions.endDate
      );
    });

    if (filteredRecords.length === 0) {
      alert("指定された期間にデータがありません。");
      return;
    }

    // CSV生成
    const csvContent = generateCSV(filteredRecords, exportOptions);
    const filename = generateFilename(
      exportOptions.startDate,
      exportOptions.endDate
    );

    // ダウンロード実行
    downloadCSV(csvContent, filename);

    if (onExport) {
      onExport();
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          CSV出力
        </CardTitle>
        <CardDescription>
          勤怠データをCSV形式でダウンロードできます
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">開始日</Label>
            <Input
              id="startDate"
              type="date"
              value={exportOptions.startDate}
              onChange={(e) =>
                setExportOptions((prev) => ({
                  ...prev,
                  startDate: e.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">終了日</Label>
            <Input
              id="endDate"
              type="date"
              value={exportOptions.endDate}
              onChange={(e) =>
                setExportOptions((prev) => ({
                  ...prev,
                  endDate: e.target.value,
                }))
              }
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label>出力オプション</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeBreaks"
                checked={exportOptions.includeBreaks}
                onCheckedChange={(checked) =>
                  setExportOptions((prev) => ({
                    ...prev,
                    includeBreaks: checked === true,
                  }))
                }
              />
              <Label htmlFor="includeBreaks">休憩時間を含める</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeNotes"
                checked={exportOptions.includeNotes}
                onCheckedChange={(checked) =>
                  setExportOptions((prev) => ({
                    ...prev,
                    includeNotes: checked === true,
                  }))
                }
              />
              <Label htmlFor="includeNotes">備考を含める</Label>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Button
            onClick={handleExport}
            className="w-full flex items-center gap-2"
            disabled={records.length === 0}
          >
            <Download className="h-4 w-4" />
            CSVファイルをダウンロード
          </Button>
        </div>

        <div className="text-sm text-gray-600">
          <p>対象レコード数: {records.length}件</p>
          <p>ファイル形式: UTF-8 BOM付きCSV</p>
        </div>
      </CardContent>
    </Card>
  );
};
