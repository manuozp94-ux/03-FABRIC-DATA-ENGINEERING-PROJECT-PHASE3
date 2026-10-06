from __future__ import annotations

import shutil
import subprocess
from pathlib import Path


REPO_ROOT = Path(
    "/Users/manuel.orozco/Desktop/CODEX PROJECTS/"
    "03-FABRIC-DATA-ENGINEERING-PROJECT-PHASE3"
)
OUTPUT_PATH = REPO_ROOT / "docs" / "professional-development" / "interview-deck-2026-04-09.pptx"
TEMP_OUTPUT_PATH = Path("/private/tmp/interview-deck-2026-04-09.pptx")


SLIDES: list[dict[str, object]] = [
    {
        "kind": "title",
        "title": "From Operations Floor to Governed Analytics Delivery",
        "subtitle": (
            "Manuel A. Orozco | Analytics Engineer / BI Lead | "
            "Operational systems, BI modernization, and Microsoft Fabric proof"
        ),
    },
    {
        "kind": "bullets",
        "title": "Career Arc: 2018 to 2026",
        "bullets": [
            "- 2018-2021: Learned the business from the floor and optimized manual processes",
            "- 2019-2021: Moved from execution support into KPI-driven tooling across supply chain, logistics, collections, and sales",
            "- 2021-2022: Formalized business-rule tooling for planning, allocation, commissions, rebates, and pricing logic",
            "- 2022-2025: Scaled BI delivery through Power BI, Power Platform, semantic logic, and governance direction",
            "- 2025-2026: Converted that experience into a governed Microsoft Fabric portfolio proof",
        ],
    },
    {
        "kind": "bullets",
        "title": "Phase 1 - Learn the Business, Earn Trust, Improve the Work",
        "bullets": [
            "- Started in assembly and warehouse execution work",
            "- Applied industrial-engineering thinking to distribute line steps and improve hourly yield",
            "- Stepped into inbound QC coverage when the manager was out",
            "- Earned trust through reliability, curiosity, and process understanding",
            "- Moved into full-time supply chain and logistics support because I showed I could do more than execute tasks",
        ],
    },
    {
        "kind": "bullets",
        "title": "Phase 2 - Excel Tools Became Early Decision Support",
        "bullets": [
            "- Built Excel-based inventory and logistics tools to maintain raw material availability without overstocking",
            "- Learned purchase-order planning, inventory planning, and procurement execution in practice",
            "- Managed customer communication across 30+ accounts in central and east-coast regions",
            "- Partnered with outside sales to clean up severe past-due debt on two major accounts without interrupting product supply",
            "- Started producing weekly sales reporting so stakeholders could read account behavior more clearly",
        ],
    },
    {
        "kind": "bullets",
        "title": "Phase 3 - From Reporting to Business-Rule Tooling",
        "bullets": [
            "- Focus shifted toward KPI drivers such as service level, lead time, inventory value, and revenue",
            "- Extracted and summarized ERP facts from SAP BusinessByDesign CSV outputs",
            "- Built demand-planning and forecasting logic that went beyond static reporting",
            "- Developed logistics allocation logic to guide inventory placement across five locations",
            "- Standardized commission, margin, rebate, and pricing logic from irregular POS-driven inputs",
        ],
    },
    {
        "kind": "bullets",
        "title": "Phase 4 - BI Modernization and Governance Direction",
        "bullets": [
            "- Maintained and evolved a BI environment that at peak supported 30 reports and 12 dashboards with a small team",
            "- Moved Excel-based logic toward Power BI Service through dataflows, modeled datasets, and DAX-based reporting logic",
            "- Built a Power Platform app using SharePoint Lists, Power Automate, Power Apps, and Power Fx for special pricing agreements",
            "- App generated BOM-based margin views, routed approvals, and reviewed active agreements against updated unit costs",
            "- Introduced documentation, workspace separation, semantic consistency, and governance direction while training a junior analyst to support execution",
        ],
    },
    {
        "kind": "bullets",
        "title": "Phase 5 - Fabric Portfolio Proof as Formalized Method",
        "bullets": [
            "- Built a bounded Microsoft Fabric proof around an inventory-readiness decision case instead of a generic sample dataset",
            "- Kept the repo as the governance plane for approved inputs, contracts, validation gates, and release records",
            "- Used Fabric as the execution plane for Bronze landing, Silver cleanup, Gold serving, and runtime governance",
            "- Added a semantic model, report shell, candidate lane, and release traceability to the proof",
            "- Published a public-safe case-study surface that explains both the business question and the technical method",
        ],
    },
    {
        "kind": "bullets",
        "title": "Why This Background Fits an Azure and SQL to Fabric Transition",
        "bullets": [
            "- I already work best in environments where logic is fragmented and definitions are still being stabilized",
            "- My background is translating operational questions into governed analytical layers, not just building visuals",
            "- I have already moved work from spreadsheets and ad hoc logic toward reusable BI and platform patterns",
            "- The platform may shift toward Fabric, but the core work is still source interpretation, modeling, governance, and adoption",
            "- I can bridge business stakeholders, BI delivery, and the newer Fabric execution layer while the data culture matures",
        ],
    },
    {
        "kind": "bullets",
        "title": "Appendix - Tooling Stack by Era",
        "bullets": [
            "- Historical stack: Excel, CSV exports, SAP BusinessByDesign, SharePoint Lists, Power BI Service, dataflows, datasets, DAX, OData/REST",
            "- Historical app layer: Power Automate, Power Apps, and Power Fx for pricing and approval workflows",
            "- Portfolio stack: Node.js automation, JSON contracts, validation gates, Python Fabric APIs, and PySpark notebooks",
            "- Portfolio serving layer: Delta Lakehouse tables, semantic model, DAX measure pack, report shell, and Astro case-study surface",
            "- Common thread: model the business first, then choose the right serving and governance layer",
        ],
    },
    {
        "kind": "bullets",
        "title": "Appendix - Current vs Target Fabric Architecture",
        "bullets": [
            "- Current state: the repo still generates and approves the bounded input package",
            "- Current state: Fabric already lands Bronze and derives Silver, Gold, runtime governance, semantic model, and report shell",
            "- Target state: Bronze becomes more honestly raw-like while Silver owns cleanup and conformance",
            "- Target state: Gold remains serving and the long-term public truth comes from a bounded Fabric-derived extract",
            "- Key distinction: understand current implemented state versus target state without overclaiming",
        ],
    },
]


def apple_quote(text: str) -> str:
    return text.replace("\\", "\\\\").replace('"', '\\"')


def join_lines(lines: list[str]) -> str:
    return '" & return & "'.join(apple_quote(line) for line in lines)


def build_osascript_args() -> list[str]:
    args = ["osascript"]
    args += ["-e", f'set outPath to ((POSIX file "{TEMP_OUTPUT_PATH}") as string)']
    args += ["-e", 'tell application "Microsoft PowerPoint"']
    args += ["-e", "activate"]
    args += ["-e", "set aPres to make new presentation"]
    args += ["-e", "delay 1"]
    args += ["-e", "tell aPres"]

    for idx, slide in enumerate(SLIDES, start=1):
        slide_var = f"s{idx}"
        kind = slide["kind"]
        if kind == "title":
            args += ["-e", f"set {slide_var} to make new slide at end with properties {{layout:slide layout title slide}}"]
            args += ["-e", "delay 0.3"]
            args += ["-e", f'set content of text range of text frame of shape 1 of {slide_var} to "{apple_quote(slide["title"])}"']
            args += ["-e", f'set content of text range of text frame of shape 2 of {slide_var} to "{apple_quote(slide["subtitle"])}"']
        else:
            args += ["-e", f"set {slide_var} to make new slide at end with properties {{layout:slide layout text slide}}"]
            args += ["-e", "delay 0.3"]
            args += ["-e", f'set content of text range of text frame of shape 1 of {slide_var} to "{apple_quote(slide["title"])}"']
            bullet_text = join_lines(slide["bullets"])  # type: ignore[arg-type]
            args += ["-e", f'set content of text range of text frame of shape 2 of {slide_var} to "{bullet_text}"']

    args += ["-e", "end tell"]
    args += ["-e", "delay 1"]
    args += ["-e", "save active presentation in outPath as presentation"]
    args += ["-e", "delay 3"]
    args += ["-e", "close active presentation"]
    args += ["-e", "end tell"]
    return args


def main() -> None:
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    if TEMP_OUTPUT_PATH.exists():
        TEMP_OUTPUT_PATH.unlink()
    subprocess.run(build_osascript_args(), check=True)
    if not TEMP_OUTPUT_PATH.exists():
        raise FileNotFoundError(f"PowerPoint did not write the expected file: {TEMP_OUTPUT_PATH}")
    shutil.copy2(TEMP_OUTPUT_PATH, OUTPUT_PATH)
    print(OUTPUT_PATH)


if __name__ == "__main__":
    main()
