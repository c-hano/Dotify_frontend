"use client";

import { useState } from "react";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pixelSize, setPixelSize] = useState(32);
  const [colorLevels, setColorLevels] = useState(4);
  const [convertType, setConvertType] = useState<"dot-png" | "dot-gif" | "dither-png">("dot-png");
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
      formData.append("colorLevels", colorLevels.toString());

      let endpoint = "";
      if (convertType === "dot-png") endpoint = "/api/v1/convert";
      else if (convertType === "dot-gif") endpoint = "/api/v1/convert-gif";
      else if (convertType === "dither-png") endpoint = "/api/v1/convert"; // 기존 PNG 엔드포인트 재사용

      const res = await fetch(`http://localhost:8080${endpoint}`, {
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
      link.download =
        convertType === "dot-gif"
          ? "pixel-art.gif"
          : convertType === "dither-png"
          ? "dither-art.png"
          : "pixel-art.png";
      link.click();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
      <h1 className="text-3xl font-bold">🎨 도트/디더링 변환기</h1>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) setSelectedFile(file);
        }}
      />

      {/* 변환 타입 선택 */}
      <div className="flex flex-col items-center gap-1">
        <span className="font-semibold mt-4">변환 타입</span>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="convertType"
              value="dot-png"
              checked={convertType === "dot-png"}
              onChange={() => setConvertType("dot-png")}
            />
            도트 PNG
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="convertType"
              value="dot-gif"
              checked={convertType === "dot-gif"}
              onChange={() => setConvertType("dot-gif")}
            />
            도트 GIF
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="convertType"
              value="dither-png"
              checked={convertType === "dither-png"}
              onChange={() => setConvertType("dither-png")}
            />
            디더링 PNG
          </label>
        </div>
      </div>

      {/* 슬라이더들 */}
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

      <div className="flex flex-col items-center gap-2">
        <label htmlFor="colorLevels" className="font-semibold">
          색상 단계: {colorLevels}
        </label>
        <input
          id="colorLevels"
          type="range"
          min={2}
          max={8}
          step={1}
          value={colorLevels}
          onChange={(e) => setColorLevels(Number(e.target.value))}
          className="w-64"
        />
      </div>

      <button
        onClick={handleConvert}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "변환 중..." : "변환하기"}
      </button>

      {error && <p className="text-red-500 font-semibold">{error}</p>}

      {resultImage && (
        <div className="mt-6 flex flex-col items-center gap-4">
          <h2 className="text-2xl font-semibold">🖼️ 변환 결과</h2>
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
