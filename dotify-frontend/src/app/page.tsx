"use client";

import { useState } from "react";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pixelSize, setPixelSize] = useState(32); // 기본값 32
  const [resultImage, setResultImage] = useState<string | null>(null);

  const handleConvert = async () => {
    if (!selectedFile) {
      alert("파일을 선택하세요!");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("pixelSize", pixelSize.toString());

    const res = await fetch("http://localhost:8080/api/v1/convert", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      alert("이미지 변환 실패 😭");
      return;
    }

    const blob = await res.blob();
    const imageUrl = URL.createObjectURL(blob);
    setResultImage(imageUrl);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
      <h1 className="text-3xl font-bold">🎨 도트 이미지 변환기</h1>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) setSelectedFile(file);
        }}
      />

      <input
        type="number"
        value={pixelSize}
        min={8}
        max={128}
        onChange={(e) => setPixelSize(Number(e.target.value))}
        className="border p-2 rounded"
      />

      <button
        onClick={handleConvert}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
      >
        변환하기
      </button>

      {resultImage && (
        <div className="mt-6">
          <h2 className="text-2xl font-semibold mb-4">🖼️ 변환된 이미지</h2>
          <img src={resultImage} alt="변환 결과" className="max-w-xs" />
        </div>
      )}
    </div>
  );
}
