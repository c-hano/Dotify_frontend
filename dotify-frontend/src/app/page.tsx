"use client";

import { useState } from "react";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pixelSize, setPixelSize] = useState(32); // 기본값 32
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = async () => {
    if (!selectedFile) {
      setError("파일을 선택하세요!");
      return;
    }

    setLoading(true);
    setError(null);
    setResultImage(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("pixelSize", pixelSize.toString());

      const res = await fetch("http://localhost:8080/api/v1/convert", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("이미지 변환에 실패했습니다.");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setResultImage(url);
    } catch (err: any) {
      setError(err.message || "알 수 없는 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (resultImage) {
      const link = document.createElement("a");
      link.href = resultImage;
      link.download = "pixel-art.png";
      link.click();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
      <h1 className="text-3xl font-bold">👾 도트 이미지 변환기 👾</h1>

      {/* 파일 업로드 */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) setSelectedFile(file);
        }}
      />

      {/* 픽셀 크기 슬라이더 */}
      <div className="flex flex-col items-center gap-2">
        <label htmlFor="pixelSize" className="font-semibold">
          픽셀 크기: {pixelSize}px
        </label>

        <input
          id="pixelSize"
          type="range"
          min={8}
          max={128}
          step={8}
          value={pixelSize}
          onChange={(e) => setPixelSize(Number(e.target.value))}
          className="w-64"
        />
      </div>

      {/* 변환 버튼 */}
      <button
        onClick={handleConvert}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "변환 중..." : "변환하기"}
      </button>

      {/* 에러 메시지 */}
      {error && <p className="text-red-500 font-semibold">{error}</p>}

      {/* 결과 이미지 + 다운로드 버튼 */}
      {resultImage && (
        <div className="mt-6 flex flex-col items-center gap-4">
          <h2 className="text-2xl font-semibold">🖼️ 변환된 이미지</h2>
          <img src={resultImage} alt="변환 결과" className="max-w-xs" />
          <button
            onClick={handleDownload}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          >
            다운로드
          </button>
        </div>
      )}
    </div>
  );
}
