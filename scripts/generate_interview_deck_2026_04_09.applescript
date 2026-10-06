on join_lines(line_list)
	set previous_delimiters to AppleScript's text item delimiters
	set AppleScript's text item delimiters to return
	set joined_text to line_list as text
	set AppleScript's text item delimiters to previous_delimiters
	return joined_text
end join_lines

on set_text_style(the_shape, point_size)
	tell font of text range of text frame of the_shape
		set font size to point_size
	end tell
end set_text_style

on add_title_slide(a_pres, slide_title, slide_subtitle)
	tell a_pres
		set new_slide to make new slide at end
		set layout of new_slide to 1
		delay 0.3
		set content of text range of text frame of shape 1 of new_slide to slide_title
		set content of text range of text frame of shape 2 of new_slide to slide_subtitle
		my set_text_style(shape 1 of new_slide, 28)
		my set_text_style(shape 2 of new_slide, 18)
	end tell
end add_title_slide

on add_bullet_slide(a_pres, slide_title, bullet_lines)
	tell a_pres
		set new_slide to make new slide at end
		set layout of new_slide to 2
		delay 0.3
		set content of text range of text frame of shape 1 of new_slide to slide_title
		set content of text range of text frame of shape 2 of new_slide to my join_lines(bullet_lines)
		my set_text_style(shape 1 of new_slide, 24)
		my set_text_style(shape 2 of new_slide, 18)
	end tell
end add_bullet_slide

set output_path to ((POSIX file "/Users/manuel.orozco/Desktop/CODEX PROJECTS/03-FABRIC-DATA-ENGINEERING-PROJECT-PHASE3/docs/professional-development/interview-deck-2026-04-09.pptx") as string)

tell application "Microsoft PowerPoint"
	activate
	set a_pres to make new presentation
	delay 1

	my add_title_slide(a_pres, "From Operations Floor to Governed Analytics Delivery", "Manuel A. Orozco | Analytics Engineer / BI Lead | Operational systems, BI modernization, and Microsoft Fabric proof")

	my add_bullet_slide(a_pres, "Career Arc: 2018 to 2026", {"- 2018-2021: Learned the business from the floor and optimized manual processes", "- 2019-2021: Moved from execution support into KPI-driven tooling across supply chain, logistics, collections, and sales", "- 2021-2022: Formalized business-rule tooling for planning, allocation, commissions, rebates, and pricing logic", "- 2022-2025: Scaled BI delivery through Power BI, Power Platform, semantic logic, and governance direction", "- 2025-2026: Converted that experience into a governed Microsoft Fabric portfolio proof"})

	my add_bullet_slide(a_pres, "Phase 1 - Learn the Business, Earn Trust, Improve the Work", {"- Started in assembly and warehouse execution work", "- Applied industrial-engineering thinking to distribute line steps and improve hourly yield", "- Stepped into inbound QC coverage when the manager was out", "- Earned trust through reliability, curiosity, and process understanding", "- Moved into full-time supply chain and logistics support because people saw I could do more than execute tasks"})

	my add_bullet_slide(a_pres, "Phase 2 - Excel Tools Became Early Decision Support", {"- Built Excel-based inventory and logistics tools to maintain raw material availability without overstocking", "- Learned purchase-order planning, inventory planning, and procurement execution in practice", "- Managed customer communication across 30+ accounts in central and east-coast regions", "- Partnered with outside sales to clean up severe past-due debt on two major accounts without interrupting product supply", "- Started producing weekly sales reporting so stakeholders could read account behavior more clearly"})

	my add_bullet_slide(a_pres, "Phase 3 - From Reporting to Business-Rule Tooling", {"- Focus shifted toward KPI drivers such as service level, lead time, inventory value, and revenue", "- Extracted and summarized ERP facts from SAP BusinessByDesign CSV outputs", "- Built demand-planning and forecasting logic that went beyond static reporting", "- Developed logistics allocation logic to guide inventory placement across five locations", "- Standardized commission, margin, rebate, and pricing logic from irregular POS-driven inputs"})

	my add_bullet_slide(a_pres, "Phase 4 - BI Modernization and Governance Direction", {"- Maintained and evolved a BI environment that at peak supported 30 reports and 12 dashboards with a small team", "- Moved Excel-based logic toward Power BI Service through dataflows, modeled datasets, and DAX-based reporting logic", "- Built a Power Platform app using SharePoint Lists, Power Automate, Power Apps, and Power Fx for special pricing agreements", "- App generated BOM-based margin views, routed approvals, and reviewed active agreements against updated unit costs", "- Introduced documentation, workspace separation, semantic consistency, and governance direction while training a junior analyst to support execution"})

	my add_bullet_slide(a_pres, "Phase 5 - Fabric Portfolio Proof as Formalized Method", {"- Built a bounded Microsoft Fabric proof around an inventory-readiness decision case instead of a generic sample dataset", "- Kept the repo as the governance plane for approved inputs, contracts, validation gates, and release records", "- Used Fabric as the execution plane for Bronze landing, Silver cleanup, Gold serving, and runtime governance", "- Added a semantic model, report shell, candidate lane, and release traceability to the proof", "- Published a public-safe case-study surface that explains both the business question and the technical method"})

	my add_bullet_slide(a_pres, "Why This Background Fits an Azure and SQL to Fabric Transition", {"- I already work best in environments where logic is fragmented and definitions are still being stabilized", "- My background is translating operational questions into governed analytical layers, not just building visuals", "- I have already moved work from spreadsheets and ad hoc logic toward reusable BI and platform patterns", "- The platform may shift toward Fabric, but the core work is still source interpretation, modeling, governance, and adoption", "- I can bridge business stakeholders, BI delivery, and the newer Fabric execution layer while the data culture matures"})

	my add_bullet_slide(a_pres, "Appendix - Tooling Stack by Era", {"- Historical stack: Excel, CSV exports, SAP BusinessByDesign, SharePoint Lists, Power BI Service, dataflows, datasets, DAX, OData/REST", "- Historical app layer: Power Automate, Power Apps, and Power Fx for pricing and approval workflows", "- Portfolio stack: Node.js automation, JSON contracts, validation gates, Python Fabric APIs, and PySpark notebooks", "- Portfolio serving layer: Delta Lakehouse tables, semantic model, DAX measure pack, report shell, and Astro case-study surface", "- Common thread: model the business first, then choose the right serving and governance layer"})

	my add_bullet_slide(a_pres, "Appendix - Current vs Target Fabric Architecture", {"- Current state: the repo still generates and approves the bounded input package", "- Current state: Fabric already lands Bronze and derives Silver, Gold, runtime governance, semantic model, and report shell", "- Target state: Bronze becomes more honestly raw-like while Silver owns cleanup and conformance", "- Target state: Gold remains serving and the long-term public truth comes from a bounded Fabric-derived extract", "- Key distinction: understand current implemented state versus target state without overclaiming"})

	delay 1
	save active presentation in output_path as 1
end tell
