"use client";

interface YearTabsProps {
    years: number[];
    selectedYear: number;
    onYearSelect: (year: number) => void;
}

export default function YearTabs({ years, selectedYear, onYearSelect }: YearTabsProps) {
    return (
        <div
            className="w-full overflow-x-auto"
            style={{ padding: "8px 24px" }}
        >
            <div
                className="flex gap-6"
                style={{ minWidth: "max-content" }}
            >
                {years.map((year) => (
                    <button
                        key={year}
                        onClick={() => onYearSelect(year)}
                        style={{
                            padding: "8px 0",
                            fontSize: "12px",
                            fontWeight: selectedYear === year ? 500 : 400,
                            color: selectedYear === year ? "#1a1a1a" : "#888",
                            background: "transparent",
                            border: "none",
                            borderBottom: selectedYear === year ? "1px solid #1a1a1a" : "1px solid transparent",
                            cursor: "pointer",
                            letterSpacing: "0.05em",
                            transition: "all 0.2s ease",
                        }}
                        aria-pressed={selectedYear === year}
                    >
                        {year}
                    </button>
                ))}
            </div>
        </div>
    );
}
