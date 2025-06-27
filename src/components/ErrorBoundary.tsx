// components/ErrorBoundary.tsx
"use client";

import React, { Component, ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive" className="max-w-md mx-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>エラーが発生しました</AlertTitle>
            <AlertDescription className="space-y-4">
              <p>
                申し訳ございません。予期しないエラーが発生しました。
                ページを再読み込みするか、しばらく時間をおいてから再度お試しください。
              </p>
              <div className="flex gap-2">
                <Button onClick={this.handleRetry} variant="outline" size="sm">
                  <RotateCcw className="h-3 w-3 mr-1" />
                  再試行
                </Button>
                <Button onClick={() => window.location.reload()} size="sm">
                  ページを再読み込み
                </Button>
              </div>
              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-xs text-muted-foreground">
                    エラー詳細（開発環境のみ）
                  </summary>
                  <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

// エラー表示用のシンプルなコンポーネント
interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  onClear?: () => void;
}

export function ErrorDisplay({ error, onRetry, onClear }: ErrorDisplayProps) {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>エラー</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>{error}</p>
        <div className="flex gap-2">
          {onRetry && (
            <Button onClick={onRetry} variant="outline" size="sm">
              <RotateCcw className="h-3 w-3 mr-1" />
              再試行
            </Button>
          )}
          {onClear && (
            <Button onClick={onClear} variant="ghost" size="sm">
              閉じる
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
