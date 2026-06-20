"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearCaseFiles, readCaseFiles } from "@/src/lib/caseFiles";
import type { CaseFile } from "@/src/lib/caseFiles";

export default function CaseFiles() {
  const [caseFiles, setCaseFiles] = useState<CaseFile[]>([]);

  useEffect(() => {
    setCaseFiles(readCaseFiles());
  }, []);

  if (caseFiles.length === 0) return null;

  return (
    <section className="case-files" aria-label="Recent case files">
      <header>
        <div>
          <p>Clerk’s archive</p>
          <h2>Case Files</h2>
        </div>
        <button
          type="button"
          onClick={() => {
            clearCaseFiles();
            setCaseFiles([]);
          }}
        >
          Clear Case Files
        </button>
      </header>
      <div className="case-file-list">
        {caseFiles.map((caseFile) => (
          <Link key={caseFile.id} href={`/trial?topic=${encodeURIComponent(caseFile.topic)}`} className="case-file-docket">
            <span className="docket-number">No. {caseFile.caseNumber}</span>
            <div>
              <h3>{caseFile.topic}</h3>
              <p>
                {new Date(caseFile.completedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                {` · ${caseFile.source === "fallback" ? "Archived" : "Live transcript"}`}
              </p>
            </div>
            <strong>{caseFile.verdict}</strong>
          </Link>
        ))}
      </div>
    </section>
  );
}
