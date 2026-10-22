#!/usr/bin/env python3
"""
IoT PULSE — Executive 12-Slide Presentation Generator
Course: 23CSE351 — Foundations of Data Science
Generates: IoT_PULSE_Presentation_12_Slides.pptx
"""

import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

# Widescreen dimensions (16:9)
SLIDE_WIDTH = Inches(13.333)
SLIDE_HEIGHT = Inches(7.5)

# Color Palette (Dark Cyber Slate Architecture)
BG_COLOR = RGBColor(11, 17, 32)         # #0B1120 Deep Dark Slate
CARD_BG = RGBColor(17, 25, 44)          # #11192C Card Surface
ELEVATED_BG = RGBColor(26, 38, 64)      # #1A2640 Elevated Surface
ACCENT_GREEN = RGBColor(16, 185, 129)   # #10B981 Emerald
ACCENT_CYAN = RGBColor(6, 182, 212)     # #06B6D4 Electric Cyan
ACCENT_AMBER = RGBColor(245, 158, 11)   # #F59E0B Warning Amber
TEXT_PRIMARY = RGBColor(248, 250, 252)  # #F8FAFC Bright Text
TEXT_SECONDARY = RGBColor(148, 163, 184)# #94A3B8 Muted Text
BORDER_COLOR = RGBColor(30, 45, 74)     # #1E2D4A Subtle Border

def set_slide_background(slide):
    background = slide.background
    fill = background.fill
    fill.solid()
    fill.fore_color.rgb = BG_COLOR

def add_header(slide, title_text, category_text, slide_num):
    # Category Tracker Badge
    cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(8.0), Inches(0.35))
    tf_cat = cat_box.text_frame
    tf_cat.word_wrap = True
    p_cat = tf_cat.paragraphs[0]
    p_cat.text = category_text.upper()
    p_cat.font.size = Pt(10)
    p_cat.font.bold = True
    p_cat.font.color.rgb = ACCENT_CYAN
    p_cat.font.name = "Calibri"

    # Main Slide Title
    title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.7), Inches(10.5), Inches(0.65))
    tf_title = title_box.text_frame
    tf_title.word_wrap = True
    p_title = tf_title.paragraphs[0]
    p_title.text = title_text
    p_title.font.size = Pt(22)
    p_title.font.bold = True
    p_title.font.color.rgb = TEXT_PRIMARY
    p_title.font.name = "Calibri"

    # Slide Number & Branding in Top Right
    num_box = slide.shapes.add_textbox(Inches(10.5), Inches(0.4), Inches(2.0), Inches(0.4))
    tf_num = num_box.text_frame
    p_num = tf_num.paragraphs[0]
    p_num.alignment = PP_ALIGN.RIGHT
    p_num.text = f"SLIDE {slide_num:02d} / 12"
    p_num.font.size = Pt(10)
    p_num.font.bold = True
    p_num.font.color.rgb = TEXT_SECONDARY
    p_num.font.name = "Calibri"

def add_card(slide, left, top, width, height, fill_color=CARD_BG, border_color=BORDER_COLOR):
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill_color
    if border_color:
        shape.line.color.rgb = border_color
        shape.line.width = Pt(1)
    else:
        shape.line.fill.background()
    return shape

def add_kpi_card(slide, left, top, width, height, value, label, subtext="", val_color=ACCENT_CYAN):
    add_card(slide, left, top, width, height)
    tb = slide.shapes.add_textbox(left + Inches(0.15), top + Inches(0.12), width - Inches(0.3), height - Inches(0.24))
    tf = tb.text_frame
    tf.word_wrap = True

    p0 = tf.paragraphs[0]
    p0.text = value
    p0.font.size = Pt(26)
    p0.font.bold = True
    p0.font.color.rgb = val_color
    p0.font.name = "Calibri"

    p1 = tf.add_paragraph()
    p1.text = label
    p1.font.size = Pt(11)
    p1.font.bold = True
    p1.font.color.rgb = TEXT_PRIMARY
    p1.font.name = "Calibri"
    p1.space_before = Pt(4)

    if subtext:
        p2 = tf.add_paragraph()
        p2.text = subtext
        p2.font.size = Pt(9)
        p2.font.color.rgb = TEXT_SECONDARY
        p2.font.name = "Calibri"
        p2.space_before = Pt(2)

def set_speaker_notes(slide, notes_text):
    notes_slide = slide.notes_slide
    text_frame = notes_slide.notes_text_frame
    text_frame.text = notes_text

def build_presentation():
    prs = Presentation()
    prs.slide_width = SLIDE_WIDTH
    prs.slide_height = SLIDE_HEIGHT
    blank_layout = prs.slide_layouts[6]

    # =========================================================================
    # SLIDE 1: Title & Cover Slide
    # =========================================================================
    slide1 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide1)

    # Decorative cyber accent bar
    bar = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.8), Inches(0.12), Inches(3.2))
    bar.fill.solid()
    bar.fill.fore_color.rgb = ACCENT_GREEN
    bar.line.fill.background()

    tb_title = slide1.shapes.add_textbox(Inches(1.2), Inches(1.6), Inches(11.0), Inches(3.6))
    tf1 = tb_title.text_frame
    tf1.word_wrap = True

    p_proj = tf1.paragraphs[0]
    p_proj.text = "FOUNDATIONS OF DATA SCIENCE (23CSE351) — FINAL CASE STUDY"
    p_proj.font.size = Pt(13)
    p_proj.font.bold = True
    p_proj.font.color.rgb = ACCENT_CYAN
    p_proj.font.name = "Calibri"

    p_main = tf1.add_paragraph()
    p_main.text = "IoT PULSE: From Traffic to Threats"
    p_main.font.size = Pt(36)
    p_main.font.bold = True
    p_main.font.color.rgb = TEXT_PRIMARY
    p_main.font.name = "Calibri"
    p_main.space_before = Pt(8)

    p_sub = tf1.add_paragraph()
    p_sub.text = "Uncovering Statistical Patterns of Normal & Malicious IoT Network Behaviour"
    p_sub.font.size = Pt(18)
    p_sub.font.color.rgb = ACCENT_GREEN
    p_sub.font.name = "Calibri"
    p_sub.space_before = Pt(6)

    p_desc = tf1.add_paragraph()
    p_desc.text = "An end-to-end empirical investigation analyzing 123,117 real-time network flows with non-parametric inference, multiclass machine learning, and interactive 3D telemetry visualization."
    p_desc.font.size = Pt(12)
    p_desc.font.color.rgb = TEXT_SECONDARY
    p_desc.font.name = "Calibri"
    p_desc.space_before = Pt(12)

    # Team Card at Bottom
    add_card(slide1, Inches(0.8), Inches(5.4), Inches(11.733), Inches(1.4))
    tb_meta = slide1.shapes.add_textbox(Inches(1.1), Inches(5.5), Inches(11.1), Inches(1.2))
    tf_meta = tb_meta.text_frame

    pm1 = tf_meta.paragraphs[0]
    pm1.text = "RESEARCH TEAM & CASE STUDY DETAILS"
    pm1.font.size = Pt(10)
    pm1.font.bold = True
    pm1.font.color.rgb = ACCENT_CYAN

    pm2 = tf_meta.add_paragraph()
    pm2.text = "Author / Presenter: Bhavith Madhu (IoT PULSE Team)  |  Dataset: RT-IOT2022 Benchmark  |  Architecture: FastAPI + DuckDB + React/Three.js + Power BI"
    pm2.font.size = Pt(12)
    pm2.font.color.rgb = TEXT_PRIMARY
    pm2.space_before = Pt(4)

    set_speaker_notes(slide1, 
        "Welcome professors and evaluation panel. Today, we present IoT PULSE: From Traffic to Threats. "
        "Our objective was to move beyond textbook descriptive analytics and build a rigorous empirical data science case study "
        "on the RT-IOT2022 dataset—combining non-parametric hypothesis testing, multiple comparison corrections, balanced machine learning, "
        "and an enterprise 3D cybersecurity dashboard."
    )

    # =========================================================================
    # SLIDE 2: Problem Statement & Research Objectives
    # =========================================================================
    slide2 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide2)
    add_header(slide2, "Problem Statement & Strategic Objectives", "Executive Context", 2)

    # Left Column: The Problem Card
    add_card(slide2, Inches(0.8), Inches(1.5), Inches(5.6), Inches(5.3))
    tb2_left = slide2.shapes.add_textbox(Inches(1.0), Inches(1.7), Inches(5.2), Inches(4.9))
    tf2_l = tb2_left.text_frame
    tf2_l.word_wrap = True

    p = tf2_l.paragraphs[0]
    p.text = "THE PROBLEM: THE IoT ATTACK SURFACE"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = ACCENT_AMBER

    points_l = [
        ("Explosion of Vulnerable IoT Nodes: ", "Over 14 billion connected smart sensors often deploy default credentials, unencrypted telemetry, and unpatched firmware."),
        ("Asymmetric Traffic Reality: ", "IoT networks do not mirror enterprise IT. Attack flows (e.g. automated SYN floods, port scans) dwarf normal sensor heartbeats by orders of magnitude."),
        ("Naive Data Science Failure: ", "Treating network flow records with textbook Gaussian assumptions or unweighted accuracy yields dangerously biased models and false security confidence.")
    ]
    for bold_text, body in points_l:
        p = tf2_l.add_paragraph()
        p.space_before = Pt(14)
        run_b = p.add_run()
        run_b.text = bold_text
        run_b.font.bold = True
        run_b.font.color.rgb = TEXT_PRIMARY
        run_b.font.size = Pt(11)
        run_t = p.add_run()
        run_t.text = body
        run_t.font.color.rgb = TEXT_SECONDARY
        run_t.font.size = Pt(11)

    # Right Column: The Objectives Card
    add_card(slide2, Inches(6.8), Inches(1.5), Inches(5.733), Inches(5.3))
    tb2_right = slide2.shapes.add_textbox(Inches(7.0), Inches(1.7), Inches(5.3), Inches(4.9))
    tf2_r = tb2_right.text_frame
    tf2_r.word_wrap = True

    p = tf2_r.paragraphs[0]
    p.text = "RESEARCH OBJECTIVES & DELIVERABLES"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = ACCENT_GREEN

    points_r = [
        ("1. Empirical Data Audit: ", "Clean 123,117 bidirectional network flows, diagnose extreme class imbalance (3,380:1 ratio), and audit 84 features."),
        ("2. 15 Structured Research Questions: ", "Formulate formal null/alternative hypotheses covering protocols, services, flow duration, packet ratios, and flags."),
        ("3. Methodological Rigour: ", "Apply non-parametric tests (Kruskal-Wallis, Mann-Whitney U, Spearman rho) and control False Discovery Rate via Benjamini-Hochberg."),
        ("4. Supervised ML Benchmark: ", "Train a cost-sensitive Random Forest with leakage-prevention to evaluate true multi-class separability."),
        ("5. Full-Stack BI & 3D Web Delivery: ", "Deploy an in-memory DuckDB analytical engine, 3D WebGL dashboard, and 5-page Power BI / Tableau report.")
    ]
    for bold_text, body in points_r:
        p = tf2_r.add_paragraph()
        p.space_before = Pt(10)
        run_b = p.add_run()
        run_b.text = bold_text
        run_b.font.bold = True
        run_b.font.color.rgb = TEXT_PRIMARY
        run_b.font.size = Pt(11)
        run_t = p.add_run()
        run_t.text = body
        run_t.font.color.rgb = TEXT_SECONDARY
        run_t.font.size = Pt(11)

    set_speaker_notes(slide2,
        "Here we articulate the core problem. The Internet of Things introduces vast asymmetry: smart devices send small periodic updates, "
        "while malicious adversaries bombard networks with thousands of automated packets per second. "
        "Our objective was fivefold: perform transparent data cleaning, answer 15 research questions with formal hypotheses, "
        "apply strict multiple-testing corrections, benchmark Random Forest with class-aware weights, and deliver enterprise visualizations."
    )

    # =========================================================================
    # SLIDE 3: Dataset Architecture & Device Topology
    # =========================================================================
    slide3 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide3)
    add_header(slide3, "Dataset Provenance & Experimental Topology", "Data Engineering", 3)

    # Top KPI Ribbon
    add_kpi_card(slide3, Inches(0.8), Inches(1.5), Inches(2.75), Inches(1.2), "123,117", "Total Flow Records", "Bidirectional Zeek Flows")
    add_kpi_card(slide3, Inches(3.75), Inches(1.5), Inches(2.75), Inches(1.2), "84", "Cleaned Features", "Temporal, volumetric & flags")
    add_kpi_card(slide3, Inches(6.7), Inches(1.5), Inches(2.75), Inches(1.2), "12", "Distinct Classes", "3 Normal IoT, 9 Malicious Attacks")
    add_kpi_card(slide3, Inches(9.65), Inches(1.5), Inches(2.883), Inches(1.2), "RT-IOT2022", "Benchmark Testbed", "Captured by Zeek & Argus")

    # Bottom Container Left: IoT Nodes & Hardware
    add_card(slide3, Inches(0.8), Inches(2.9), Inches(5.6), Inches(3.9))
    tb3_l = slide3.shapes.add_textbox(Inches(1.0), Inches(3.05), Inches(5.2), Inches(3.6))
    tf3_l = tb3_l.text_frame
    tf3_l.word_wrap = True

    p = tf3_l.paragraphs[0]
    p.text = "TESTBED PHYSICAL & VIRTUAL TOPOLOGY"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = ACCENT_CYAN

    devices = [
        ("Wipro Smart LED Bulb: ", "Generates real-time WiFi smart-home actuation events."),
        ("ThingSpeak Weather Station: ", "Sends periodic telemetry updates (Temperature, Humidity) over HTTP/REST."),
        ("MQTT Broker (Mosquitto): ", "Subscribes and publishes lightweight IoT broker telemetry payloads."),
        ("Zeek Network Security Monitor: ", "Extracts bidirectional session flow state, timing intervals, and TCP flag histograms.")
    ]
    for dev, desc in devices:
        p = tf3_l.add_paragraph()
        p.space_before = Pt(8)
        rb = p.add_run()
        rb.text = dev
        rb.font.bold = True
        rb.font.color.rgb = TEXT_PRIMARY
        rb.font.size = Pt(10.5)
        rt = p.add_run()
        rt.text = desc
        rt.font.color.rgb = TEXT_SECONDARY
        rt.font.size = Pt(10.5)

    # Bottom Container Right: Attack Categories
    add_card(slide3, Inches(6.8), Inches(2.9), Inches(5.733), Inches(3.9))
    tb3_r = slide3.shapes.add_textbox(Inches(7.0), Inches(3.05), Inches(5.3), Inches(3.6))
    tf3_r = tb3_r.text_frame
    tf3_r.word_wrap = True

    p = tf3_r.paragraphs[0]
    p.text = "ATTACK EMULATION VECTORS"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = ACCENT_AMBER

    attacks = [
        ("Denial of Service (DoS): ", "Hping3 SYN floods and Slowloris HTTP keep-alive exhaustion."),
        ("Distributed Denial of Service (DDoS): ", "Coordinated TCP/UDP volumetric floods from distributed attack nodes."),
        ("Active Reconnaissance: ", "Nmap sweeps (OS fingerprinting, SYN stealth, FIN scan, XMAS tree scan)."),
        ("Man-in-the-Middle (MitM): ", "ARP poisoning targeting local subnet gateway interfaces."),
        ("Service Exploitation: ", "Metasploit payloads and SSH dictionary brute-force intrusions.")
    ]
    for atk, desc in attacks:
        p = tf3_r.add_paragraph()
        p.space_before = Pt(8)
        rb = p.add_run()
        rb.text = atk
        rb.font.bold = True
        rb.font.color.rgb = TEXT_PRIMARY
        rb.font.size = Pt(10.5)
        rt = p.add_run()
        rt.text = desc
        rt.font.color.rgb = TEXT_SECONDARY
        rt.font.size = Pt(10.5)

    set_speaker_notes(slide3,
        "The RT-IOT2022 dataset captures realistic smart-home IoT devices paired with real-world attacks. "
        "Notice our 4 baseline metrics: 123,117 flow records across 84 features, grouped into 12 classes. "
        "Normal operations comprise real Wipro smart bulbs, ThingSpeak sensors, and MQTT brokers. "
        "Attacks include Hping3, Slowloris, ARP poisoning, and Nmap reconnaissance."
    )

    # =========================================================================
    # SLIDE 4: Data Preprocessing & Quality Audit
    # =========================================================================
    slide4 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide4)
    add_header(slide4, "Data Preprocessing Choices & Quality Audit", "Data Hygiene & Validation", 4)

    # 3 Column Cards
    col_w = Inches(3.65)
    gap = Inches(0.39)

    # Card 1: Missing & Duplicate Audit
    add_card(slide4, Inches(0.8), Inches(1.5), col_w, Inches(5.3))
    tb4_1 = slide4.shapes.add_textbox(Inches(1.0), Inches(1.7), col_w - Inches(0.4), Inches(4.9))
    tf4_1 = tb4_1.text_frame
    tf4_1.word_wrap = True
    p = tf4_1.paragraphs[0]
    p.text = "INTEGRITY AUDIT"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = ACCENT_CYAN

    items_1 = [
        ("Missing Values: 0", "All 123,117 rows have complete network readings across 84 attributes."),
        ("Full Duplicate Rows: 0", "No identical duplicate rows existed in the raw dataset."),
        ("Feature Repeats: 1,180", "1,180 records shared identical feature tuples across different labels. These were retained to reflect genuine IoT packet bursts.")
    ]
    for title, desc in items_1:
        p = tf4_1.add_paragraph()
        p.space_before = Pt(12)
        p.text = title
        p.font.bold = True
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_PRIMARY
        p2 = tf4_1.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(10)
        p2.font.color.rgb = TEXT_SECONDARY

    # Card 2: Cleaning Steps
    add_card(slide4, Inches(0.8) + col_w + gap, Inches(1.5), col_w, Inches(5.3))
    tb4_2 = slide4.shapes.add_textbox(Inches(1.0) + col_w + gap, Inches(1.7), col_w - Inches(0.4), Inches(4.9))
    tf4_2 = tb4_2.text_frame
    tf4_2.word_wrap = True
    p = tf4_2.paragraphs[0]
    p.text = "PREPROCESSING CHOICES"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = ACCENT_GREEN

    items_2 = [
        ("Index Column Removal", "The raw column `Unnamed: 0` was an artifact of CSV export, carrying no network measurement, and was immediately dropped."),
        ("Whitespace Normalization", "All column headers and categorical string labels were stripped of whitespace."),
        ("Data Type Conversion", "Object columns parsed as numeric if >= 98% parsed successfully without corruption.")
    ]
    for title, desc in items_2:
        p = tf4_2.add_paragraph()
        p.space_before = Pt(12)
        p.text = title
        p.font.bold = True
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_PRIMARY
        p2 = tf4_2.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(10)
        p2.font.color.rgb = TEXT_SECONDARY

    # Card 3: Outlier & Leakage Controls
    add_card(slide4, Inches(0.8) + (col_w + gap) * 2, Inches(1.5), col_w, Inches(5.3))
    tb4_3 = slide4.shapes.add_textbox(Inches(1.0) + (col_w + gap) * 2, Inches(1.7), col_w - Inches(0.4), Inches(4.9))
    tf4_3 = tb4_3.text_frame
    tf4_3.word_wrap = True
    p = tf4_3.paragraphs[0]
    p.text = "LEAKAGE & OUTLIERS"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = ACCENT_AMBER

    items_3 = [
        ("Port Number Dropping", "Network port fields (`id.orig_p`, `id.resp_p`) were removed from ML features to prevent models from memorizing attack port signatures."),
        ("Tukey 1.5x IQR Fencing", "Evaluated all 81 continuous features; identified high outlier rates in packet rate (53.3%) and payload bytes (28.4%)."),
        ("Non-Destructive Policy", "Outliers reflect genuine denial-of-service volumetric spikes and were preserved rather than clipped.")
    ]
    for title, desc in items_3:
        p = tf4_3.add_paragraph()
        p.space_before = Pt(12)
        p.text = title
        p.font.bold = True
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_PRIMARY
        p2 = tf4_3.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(10)
        p2.font.color.rgb = TEXT_SECONDARY

    set_speaker_notes(slide4,
        "Data hygiene was our first priority. We confirmed zero missing values across all 84 columns. "
        "Importantly, we dropped 'Unnamed: 0' so row indices wouldn't contaminate the analysis. "
        "We also removed port numbers before training our model to prevent artificial label leakage. "
        "Outliers were audited via Tukey's 1.5x IQR fence, but preserved because high packet rates are genuine attack signatures."
    )

    # =========================================================================
    # SLIDE 5: Exploratory Data Analysis & Class Imbalance
    # =========================================================================
    slide5 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide5)
    add_header(slide5, "Exploratory Data Analysis: Class Imbalance & Skewness", "Empirical Baseline", 5)

    # Top KPI Ribbon
    add_kpi_card(slide5, Inches(0.8), Inches(1.5), Inches(2.75), Inches(1.2), "89.84%", "Malicious Traffic Share", "110,610 attack flows", ACCENT_AMBER)
    add_kpi_card(slide5, Inches(3.75), Inches(1.5), Inches(2.75), Inches(1.2), "10.16%", "Normal Traffic Share", "12,507 benign device flows", ACCENT_GREEN)
    add_kpi_card(slide5, Inches(6.7), Inches(1.5), Inches(2.75), Inches(1.2), "3,380 : 1", "Extreme Imbalance Ratio", "DOS_SYN_Hping vs NMAP_FIN", ACCENT_CYAN)
    add_kpi_card(slide5, Inches(9.65), Inches(1.5), Inches(2.883), Inches(1.2), "89.69%", "TCP Protocol Dominance", "110,427 TCP sessions", TEXT_PRIMARY)

    # Left Container: Class Breakdown Table
    add_card(slide5, Inches(0.8), Inches(2.9), Inches(6.8), Inches(3.9))
    tb5_tbl = slide5.shapes.add_textbox(Inches(1.0), Inches(3.05), Inches(6.4), Inches(3.6))
    tf5_t = tb5_tbl.text_frame
    tf5_t.word_wrap = True

    p = tf5_t.paragraphs[0]
    p.text = "ATTACK & BENIGN CLASS DISTRIBUTION (TABLE)"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = ACCENT_CYAN

    table_data = [
        ("DOS_SYN_Hping", "94,659", "76.89%", "Malicious (SYN Flood)"),
        ("Thing_Speak", "8,108", "6.59%", "Normal (Sensor Telemetry)"),
        ("ARP_poisioning", "7,750", "6.30%", "Malicious (MitM Spoofing)"),
        ("MQTT_Publish", "4,146", "3.37%", "Normal (Broker Messages)"),
        ("NMAP_UDP_SCAN", "2,590", "2.10%", "Malicious (Port Sweep)"),
        ("NMAP_XMAS_TREE", "2,010", "1.63%", "Malicious (Reconnaissance)"),
        ("Wipro_bulb", "253", "0.21%", "Normal (Smart Lighting)"),
        ("NMAP_FIN_SCAN", "28", "0.02%", "Malicious (Minority Label)")
    ]
    for label, count, pct, note in table_data:
        p = tf5_t.add_paragraph()
        p.space_before = Pt(3)
        p.text = f"{label:<16}  |  {count:>6}  |  {pct:>6}  |  {note}"
        p.font.size = Pt(9.5)
        p.font.name = "Consolas"
        p.font.color.rgb = TEXT_PRIMARY if "Normal" in note else TEXT_SECONDARY

    # Right Container: Analytical Implications
    add_card(slide5, Inches(7.8), Inches(2.9), Inches(4.733), Inches(3.9))
    tb5_r = slide5.shapes.add_textbox(Inches(8.0), Inches(3.05), Inches(4.3), Inches(3.6))
    tf5_r = tb5_r.text_frame
    tf5_r.word_wrap = True

    p = tf5_r.paragraphs[0]
    p.text = "STATISTICAL & MODEL IMPLICATIONS"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = ACCENT_AMBER

    implications = [
        ("Accuracy Paradox: ", "A naive model predicting purely 'DOS_SYN_Hping' achieves 76.89% raw accuracy while completely missing all IoT attacks and normal devices."),
        ("Non-Gaussian Distributions: ", "Flow durations, packet counts, and byte rates exhibit severe right-skewness and zero-inflation, invalidating standard Student's t-tests."),
        ("Rank-Based Necessity: ", "All hypothesis testing must utilize non-parametric rank tests (Kruskal-Wallis, Mann-Whitney U, Spearman rho).")
    ]
    for title, desc in implications:
        p = tf5_r.add_paragraph()
        p.space_before = Pt(10)
        rb = p.add_run()
        rb.text = title
        rb.font.bold = True
        rb.font.color.rgb = TEXT_PRIMARY
        rb.font.size = Pt(10.5)
        rt = p.add_run()
        rt.text = desc
        rt.font.color.rgb = TEXT_SECONDARY
        rt.font.size = Pt(10)

    set_speaker_notes(slide5,
        "Our exploratory analysis uncovered an extreme 3,380-to-1 class imbalance ratio. "
        "DOS_SYN_Hping accounts for nearly 77% of all records, while NMAP_FIN_SCAN accounts for only 28 flows (0.02%). "
        "This is crucial: standard accuracy is completely deceptive here. Furthermore, telemetry distributions are heavily skewed, "
        "confirming that parametric Gaussian assumptions would produce invalid inferences."
    )

    # =========================================================================
    # SLIDE 6: Hypothesis Testing Across 15 Research Questions
    # =========================================================================
    slide6 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide6)
    add_header(slide6, "Hypothesis Testing Battery: 15 Research Questions", "Inferential Statistics", 6)

    # Main Table Container
    add_card(slide6, Inches(0.8), Inches(1.5), Inches(11.733), Inches(5.3))
    tb6 = slide6.shapes.add_textbox(Inches(1.0), Inches(1.65), Inches(11.3), Inches(5.0))
    tf6 = tb6.text_frame
    tf6.word_wrap = True

    p = tf6.paragraphs[0]
    p.text = "FORMAL INFERENTIAL TESTS & BENJAMINI-HOCHBERG FDR ADJUSTMENT"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = ACCENT_GREEN

    headers = f"{'Question / Topic':<28} | {'Statistical Test':<18} | {'Test Statistic':<16} | {'Raw p':<9} | {'BH-FDR p':<9} | {'Effect Size'}"
    p_head = tf6.add_paragraph()
    p_head.text = headers
    p_head.font.size = Pt(9.5)
    p_head.font.bold = True
    p_head.font.color.rgb = ACCENT_CYAN
    p_head.font.name = "Consolas"
    p_head.space_before = Pt(4)

    test_rows = [
        ("Q2  Protocol Association", "Pearson Chi-Square", "Chi2 = 83,803.12", "< 0.0001", "< 0.0001", "Cramer's V = 0.5834"),
        ("Q3  Service Association", "Pearson Chi-Square", "Chi2 = 301,729.10", "< 0.0001", "< 0.0001", "Cramer's V = 0.6391"),
        ("Q4  Duration Across Labels", "Kruskal-Wallis", "H = 44,749.48", "< 0.0001", "< 0.0001", "eta2[H] = 0.3635"),
        ("Q5  Packets Across Labels", "Kruskal-Wallis", "H = 59,302.94", "< 0.0001", "< 0.0001", "eta2[H] = 0.4817"),
        ("Q6  Fwd vs Bwd Packets", "Spearman Rho", "rho = 0.7463", "< 0.0001", "< 0.0001", "t = 394.04"),
        ("Q7  TCP vs UDP Pkt Rate", "Mann-Whitney U", "U = 1.208 x 10^9", "< 0.0001", "< 0.0001", "Rank-Biserial = 0.7314"),
        ("Q8  TCP vs UDP Payload", "Mann-Whitney U", "U = 1.159 x 10^9", "< 0.0001", "< 0.0001", "Rank-Biserial = 0.6622"),
        ("Q9  SYN Flags Across Labels", "Kruskal-Wallis", "H = 57,883.20", "< 0.0001", "< 0.0001", "eta2[H] = 0.4702"),
        ("Q10 High-SYN Proportion", "Two-Proportion z", "z = -196.1240", "< 0.0001", "< 0.0001", "95% CI [-0.377, -0.366]"),
        ("Q11 Duration vs Pkt Rate", "Spearman Rho", "rho = -0.2959", "< 0.0001", "< 0.0001", "t = -108.06"),
        ("Q14 MQTT vs Non-MQTT", "Mann-Whitney U", "U = 4.883 x 10^8", "< 0.0001", "< 0.0001", "Rank-Biserial = 0.9864")
    ]
    for q, test, stat, raw_p, adj_p, eff in test_rows:
        p_row = tf6.add_paragraph()
        p_row.text = f"{q:<28} | {test:<18} | {stat:<16} | {raw_p:<9} | {adj_p:<9} | {eff}"
        p_row.font.size = Pt(9)
        p_row.font.name = "Consolas"
        p_row.font.color.rgb = TEXT_PRIMARY
        p_row.space_before = Pt(2)

    p_note = tf6.add_paragraph()
    p_note.text = "Conclusion: 11 of 11 inferential tests reject H0 with BH-FDR adjusted p < 0.0001 (100% survival rate). All comparisons reflect observational associations."
    p_note.font.size = Pt(9.5)
    p_note.font.bold = True
    p_note.font.color.rgb = ACCENT_AMBER
    p_note.space_before = Pt(8)

    set_speaker_notes(slide6,
        "This slide presents the core statistical rigor of our project. Across the 15 research questions, "
        "we conducted 11 formal inferential tests spanning Pearson Chi-Square, Kruskal-Wallis, Mann-Whitney U, and Spearman correlation. "
        "To avoid the multiple comparisons fallacy, we applied the Benjamini-Hochberg False Discovery Rate correction at alpha = 0.05. "
        "All 11 tests maintained adjusted p-values below 0.0001. We report both test statistics and standardized effect sizes."
    )

    # =========================================================================
    # SLIDE 7: Key Anomaly: The High-SYN Counter-Intuition (Q10)
    # =========================================================================
    slide7 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide7)
    add_header(slide7, "Critical Analytical Anomaly: The High-SYN Paradox (Q10)", "Deep Domain Insight", 7)

    # Left Container: The Counter-Intuitive Evidence
    add_card(slide7, Inches(0.8), Inches(1.5), Inches(5.6), Inches(5.3))
    tb7_l = slide7.shapes.add_textbox(Inches(1.0), Inches(1.7), Inches(5.2), Inches(4.9))
    tf7_l = tb7_l.text_frame
    tf7_l.word_wrap = True

    p = tf7_l.paragraphs[0]
    p.text = "EMPIRICAL FINDING: TWO-PROPORTION TEST"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = ACCENT_AMBER

    points_q10 = [
        ("Hypothesis Under Test: ", "H0: The proportion of high-SYN flows (fwd_SYN > 1) is equal between DOS_SYN_Hping and other network labels."),
        ("Observed High-SYN Proportion: ", "• DOS_SYN_Hping: 0.00% (0 of 94,659 flows)\n• Other Network Traffic: 37.15% (10,571 of 28,458 flows)"),
        ("Test Statistic & Confidence Interval: ", "z = -196.1240, p < 0.0001\n95% Wald CI for Difference: [-0.3771, -0.3658]"),
        ("The Immediate Paradox: ", "Why does a notorious 'SYN Flood' attack exhibit ZERO high-SYN flow records?")
    ]
    for title, desc in points_q10:
        p = tf7_l.add_paragraph()
        p.space_before = Pt(10)
        rb = p.add_run()
        rb.text = title
        rb.font.bold = True
        rb.font.color.rgb = TEXT_PRIMARY
        rb.font.size = Pt(10.5)
        rt = p.add_run()
        rt.text = desc
        rt.font.color.rgb = TEXT_SECONDARY
        rt.font.size = Pt(10.5)

    # Right Container: Cybersecurity Domain Explanation
    add_card(slide7, Inches(6.8), Inches(1.5), Inches(5.733), Inches(5.3))
    tb7_r = slide7.shapes.add_textbox(Inches(7.0), Inches(1.7), Inches(5.3), Inches(4.9))
    tf7_r = tb7_r.text_frame
    tf7_r.word_wrap = True

    p = tf7_r.paragraphs[0]
    p.text = "NETWORK PROTOCOL & ZEEK LOGGING REASONING"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = ACCENT_GREEN

    explanations = [
        ("1. Single-Packet Spoofing Architecture: ", "Hping3 crafts automated single-packet SYN requests with randomized source IP addresses. The adversary never intends to complete the 3-way TCP handshake."),
        ("2. Zeek Flow Aggregation Boundary: ", "Zeek monitors network flows. Because each spoofed SYN arrives from a unique pseudo-random port/IP pair without a response, Zeek logs each attempt as an isolated, 1-packet flow."),
        ("3. Why Benign Flows Have High-SYN Counts: ", "Legitimate IoT connections (e.g. MQTT retries, ThingSpeak HTTP reconnects) experience packet loss and re-transmit SYN packets within the same continuous TCP session."),
        ("4. Critical Lesson for Detection Engineers: ", "Filtering on 'high SYN packets per flow' will completely miss Hping3 SYN floods! Real-world detection must monitor global connection rates, not per-flow SYN flags.")
    ]
    for title, desc in explanations:
        p = tf7_r.add_paragraph()
        p.space_before = Pt(10)
        rb = p.add_run()
        rb.text = title
        rb.font.bold = True
        rb.font.color.rgb = TEXT_PRIMARY
        rb.font.size = Pt(10.5)
        rt = p.add_run()
        rt.text = desc
        rt.font.color.rgb = TEXT_SECONDARY
        rt.font.size = Pt(10.5)

    set_speaker_notes(slide7,
        "Question 10 revealed one of the most critical domain insights in this case study: The High-SYN Paradox. "
        "Intuition suggests a SYN flood would have thousands of SYN flags per flow. But our statistical test returned z = -196.12, "
        "revealing that DOS_SYN_Hping had 0.00% high-SYN flows. Why? Because Hping3 spoofs source addresses, sending single-packet SYNs. "
        "Zeek records each as an isolated single-packet flow. Meanwhile, normal IoT connections that retransmit have higher SYN counts. "
        "This proves why statistical data science is essential for cybersecurity detection engineering."
    )

    # =========================================================================
    # SLIDE 8: Machine Learning Benchmark (Random Forest)
    # =========================================================================
    slide8 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide8)
    add_header(slide8, "Supervised Machine Learning: Random Forest Benchmark", "Model Evaluation & Benchmarking", 8)

    # Top KPI Ribbon
    add_kpi_card(slide8, Inches(0.8), Inches(1.5), Inches(2.75), Inches(1.2), "0.9338", "Random Forest Macro-F1", "Balanced Across All 12 Classes", ACCENT_GREEN)
    add_kpi_card(slide8, Inches(3.75), Inches(1.5), Inches(2.75), Inches(1.2), "0.0724", "Majority Baseline F1", "Severe Class Imbalance Floor", ACCENT_AMBER)
    add_kpi_card(slide8, Inches(6.7), Inches(1.5), Inches(2.75), Inches(1.2), "+0.8614", "Macro-F1 Model Lift", "True Empirical Improvement", ACCENT_CYAN)
    add_kpi_card(slide8, Inches(9.65), Inches(1.5), Inches(2.883), Inches(1.2), "0.9380", "Balanced Accuracy", "vs 0.0833 baseline", TEXT_PRIMARY)

    # Left Container: Methodology & Parameters
    add_card(slide8, Inches(0.8), Inches(2.9), Inches(5.6), Inches(3.9))
    tb8_l = slide8.shapes.add_textbox(Inches(1.0), Inches(3.05), Inches(5.2), Inches(3.6))
    tf8_l = tb8_l.text_frame
    tf8_l.word_wrap = True

    p = tf8_l.paragraphs[0]
    p.text = "MODEL CONFIGURATION & VALIDATION"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = ACCENT_CYAN

    configs = [
        ("Algorithm Choice: ", "Random Forest Classifier (100 estimators, max_depth=20, random_state=42). Selected for robustness against extreme outliers and non-linear interactions."),
        ("Class-Weight Adjustment: ", "`class_weight='balanced_subsample'` recalculates tree weights per bootstrap sample, giving minority labels (e.g. NMAP_FIN) proportional penalty."),
        ("Leakage Protection: ", "Source and destination port numbers were strictly excluded prior to training."),
        ("Validation Strategy: ", "Stratified 80/20 train/test split (98,493 train / 24,624 test flows) preserving exact minority proportions.")
    ]
    for k, v in configs:
        p = tf8_l.add_paragraph()
        p.space_before = Pt(8)
        rb = p.add_run()
        rb.text = k
        rb.font.bold = True
        rb.font.color.rgb = TEXT_PRIMARY
        rb.font.size = Pt(10.5)
        rt = p.add_run()
        rt.text = v
        rt.font.color.rgb = TEXT_SECONDARY
        rt.font.size = Pt(10.5)

    # Right Container: Top Predictive Features
    add_card(slide8, Inches(6.8), Inches(2.9), Inches(5.733), Inches(3.9))
    tb8_r = slide8.shapes.add_textbox(Inches(7.0), Inches(3.05), Inches(5.3), Inches(3.6))
    tf8_r = tb8_r.text_frame
    tf8_r.word_wrap = True

    p = tf8_r.paragraphs[0]
    p.text = "TOP 10 PREDICTIVE FEATURES (GINI IMPORTANCE)"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = ACCENT_GREEN

    feats = [
        ("1. fwd_URG_flag_count", "0.0418", "Identifies XMAS tree scans & abnormal control packets"),
        ("2. fwd_last_window_size", "0.0406", "Distinguishes TCP buffer management across tools"),
        ("3. fwd_PSH_flag_count", "0.0390", "Differentiates push-data flows (MQTT) from scans"),
        ("4. fwd_header_size_tot", "0.0331", "Separates single-packet floods from real payloads"),
        ("5. fwd_pkts_payload.avg", "0.0326", "Highlights sensor data payloads vs zero-byte scans"),
        ("6. flow_iat.min", "0.0325", "Captures high-frequency automated script bursts"),
        ("7. fwd_header_size_min", "0.0319", "Measures minimal TCP/IP header footprints")
    ]
    for feat, imp, desc in feats:
        p = tf8_r.add_paragraph()
        p.space_before = Pt(4)
        p.text = f"{feat:<22}  |  {imp}  |  {desc}"
        p.font.size = Pt(9.5)
        p.font.name = "Consolas"
        p.font.color.rgb = TEXT_PRIMARY

    set_speaker_notes(slide8,
        "To satisfy the machine learning requirement, we trained a cost-sensitive Random Forest classifier. "
        "Because our dataset is imbalanced, accuracy is meaningless. We report Macro-F1 score: our model achieves 0.9338 "
        "compared to the majority-class baseline of 0.0724, demonstrating an empirical lift of +0.8614. "
        "Top predictive features include urgent flag counts, TCP window sizes, and push flag counts—directly reflecting the protocol mechanics."
    )

    # =========================================================================
    # SLIDE 9: Full-Stack Architecture & 3D Analytics Experience
    # =========================================================================
    slide9 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide9)
    add_header(slide9, "Full-Stack Platform: In-Memory DuckDB & 3D SOC", "Software & Systems Architecture", 9)

    # 4 Column Architecture Cards
    w4 = Inches(2.7)
    g4 = Inches(0.31)

    cards_arch = [
        ("1. IN-MEMORY ENGINE", "DuckDB Columnar OLAP", ACCENT_CYAN, [
            "All 123,117 rows registered in memory as `flows` table.",
            "Sub-15ms SQL aggregations without database overhead.",
            "Dynamic SQL query API endpoint supporting live filter slicing."
        ]),
        ("2. BACKEND API", "FastAPI + Python 3.9", ACCENT_GREEN, [
            "15+ structured REST endpoints.",
            "Pydantic schemas for automated response validation.",
            "Export router serving dynamic CSV tables for BI tools."
        ]),
        ("3. 3D WEB PLATFORM", "React + Three.js + R3F", ACCENT_AMBER, [
            "Interactive 3D Network Intelligence Globe.",
            "Real-time node cluster inspection & spatial topology controls.",
            "Cyber SOC executive dashboard with dark/light mode toggle."
        ]),
        ("4. QUALITY AUDIT", "Pytest Test Suite", TEXT_PRIMARY, [
            "17 / 17 automated tests passing.",
            "Verifies API health, ML endpoints, SQL query engine, and exports.",
            "Production Vite build compiles in 2.08 seconds."
        ])
    ]
    for i, (head, sub, col, bullets) in enumerate(cards_arch):
        left_pos = Inches(0.8) + (w4 + g4) * i
        add_card(slide9, left_pos, Inches(1.5), w4, Inches(5.3))
        tb = slide9.shapes.add_textbox(left_pos + Inches(0.15), Inches(1.7), w4 - Inches(0.3), Inches(4.9))
        tf = tb.text_frame
        tf.word_wrap = True

        p = tf.paragraphs[0]
        p.text = head
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = col

        p_sub = tf.add_paragraph()
        p_sub.text = sub
        p_sub.font.size = Pt(13)
        p_sub.font.bold = True
        p_sub.font.color.rgb = TEXT_PRIMARY
        p_sub.space_before = Pt(4)

        for b in bullets:
            p_b = tf.add_paragraph()
            p_b.space_before = Pt(8)
            p_b.text = "• " + b
            p_b.font.size = Pt(9.5)
            p_b.font.color.rgb = TEXT_SECONDARY

    set_speaker_notes(slide9,
        "We elevated this project from a static notebook into an enterprise-grade full-stack platform. "
        "The architecture combines an in-memory DuckDB columnar engine executing SQL queries over 123k records in under 15 milliseconds, "
        "a FastAPI REST service, an interactive 3D WebGL network globe built with React and Three.js, "
        "and a 100% passing test suite of 17 automated Pytest unit tests."
    )

    # =========================================================================
    # SLIDE 10: Business Intelligence: Power BI & Tableau Integration
    # =========================================================================
    slide10 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide10)
    add_header(slide10, "Business Intelligence: Power BI & Tableau Implementation", "Enterprise BI Deliverables", 10)

    # Top KPI Ribbon
    add_kpi_card(slide10, Inches(0.8), Inches(1.5), Inches(2.75), Inches(1.2), "5 Pages", "Power BI Report Structure", "Executive to Data Audit", ACCENT_CYAN)
    add_kpi_card(slide10, Inches(3.75), Inches(1.5), Inches(2.75), Inches(1.2), "170+ Lines", "DAX Measures Library", "Pre-computed Analytical DAX", ACCENT_GREEN)
    add_kpi_card(slide10, Inches(6.7), Inches(1.5), Inches(2.75), Inches(1.2), "10 Tables", "Curated Export CSVs", "Pre-aggregated BI Dimensions", ACCENT_AMBER)
    add_kpi_card(slide10, Inches(9.65), Inches(1.5), Inches(2.883), Inches(1.2), "Dual-Mode", "Connection Architecture", "Live API + Offline CSV", TEXT_PRIMARY)

    # Left Container: Power BI Implementation
    add_card(slide10, Inches(0.8), Inches(2.9), Inches(5.6), Inches(3.9))
    tb10_l = slide10.shapes.add_textbox(Inches(1.0), Inches(3.05), Inches(5.2), Inches(3.6))
    tf10_l = tb10_l.text_frame
    tf10_l.word_wrap = True

    p = tf10_l.paragraphs[0]
    p.text = "POWER BI DESKTOP SPECIFICATIONS"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = ACCENT_CYAN

    pbi_pages = [
        ("Page 1: Executive Overview", "Macro traffic gauge (89.8% malicious), attack donut, and TCP dominance."),
        ("Page 2: Attack Flow Profiles", "Flow duration bar chart and bidirectional packet volume scatter plots."),
        ("Page 3: Statistical Hypotheses", "Interactive matrix of 11 hypothesis tests with FDR significance indicators."),
        ("Page 4: Model Evaluation", "12x12 confusion matrix heatmap and top 20 Gini feature bars."),
        ("Page 5: Quality & Caveats", "Missing value audit (0 missing) and observational study disclosures.")
    ]
    for title, desc in pbi_pages:
        p = tf10_l.add_paragraph()
        p.space_before = Pt(6)
        rb = p.add_run()
        rb.text = title + ": "
        rb.font.bold = True
        rb.font.color.rgb = TEXT_PRIMARY
        rb.font.size = Pt(10)
        rt = p.add_run()
        rt.text = desc
        rt.font.color.rgb = TEXT_SECONDARY
        rt.font.size = Pt(9.5)

    # Right Container: Integration Architecture
    add_card(slide10, Inches(6.8), Inches(2.9), Inches(5.733), Inches(3.9))
    tb10_r = slide10.shapes.add_textbox(Inches(7.0), Inches(3.05), Inches(5.3), Inches(3.6))
    tf10_r = tb10_r.text_frame
    tf10_r.word_wrap = True

    p = tf10_r.paragraphs[0]
    p.text = "BI INTEGRATION ARCHITECTURE"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = ACCENT_GREEN

    integrations = [
        ("Power Query M Integration: ", "Included `PowerQuery_M_Templates.pq` enables dynamic refresh via `Json.Document(Web.Contents('http://127.0.0.1:8000/api/...'))`."),
        ("Star-Schema Modeling: ", "Fact table `Flows` connected via 1-to-many relationships to `AttackDistribution`, `ProtocolDistribution`, and `ServiceDistribution`."),
        ("One-Click Web Export: ", "The web application topbar includes an 'Export Curated CSV' button streaming `iot_pulse_clean_flows.csv` directly into Power BI."),
        ("Native macOS Tableau Workbook: ", "Includes `IoT_PULSE_Cybersecurity_Analytics.twb` configured for native cross-platform macOS evaluation.")
    ]
    for title, desc in integrations:
        p = tf10_r.add_paragraph()
        p.space_before = Pt(8)
        rb = p.add_run()
        rb.text = title
        rb.font.bold = True
        rb.font.color.rgb = TEXT_PRIMARY
        rb.font.size = Pt(10)
        rt = p.add_run()
        rt.text = desc
        rt.font.color.rgb = TEXT_SECONDARY
        rt.font.size = Pt(9.5)

    set_speaker_notes(slide10,
        "To satisfy the Business Intelligence requirement, we constructed comprehensive Power BI and Tableau deliverables. "
        "We modeled a star schema connecting 10 curated export tables, wrote 170+ lines of enterprise DAX measures, "
        "and designed a 5-page Power BI dashboard. It supports live dynamic API refresh via Power Query M as well as offline CSV ingestion. "
        "A native Tableau workbook is also provided for cross-platform macOS demonstration."
    )

    # =========================================================================
    # SLIDE 11: Critical Research Limitations & Academic Caveats
    # =========================================================================
    slide11 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide11)
    add_header(slide11, "Research Limitations & Observational Caveats", "Academic Rigour & Honesty", 11)

    # 4 Structured Limitation Cards
    w2 = Inches(5.6)
    h2 = Inches(2.55)
    gap_x = Inches(0.533)
    gap_y = Inches(0.2)

    limitations = [
        ("1. Observational Study (Not Randomized A/B)", ACCENT_AMBER, 
         "The dataset consists of observational recorded network traffic. Group comparisons (TCP vs UDP, MQTT vs Non-MQTT) do not feature randomized assignment to treatment and control. Statistical associations must not be interpreted as causal relationships."),
        ("2. Lab Testbed Generalization Limits", ACCENT_CYAN,
         "Data was captured in an emulated IoT testbed. Machine learning scores reflect separability within this specific collection session; models may not generalize identically to unseen zero-days, production networks, or unrepresented IoT devices."),
        ("3. Statistical Flow Dependence & Clustering", ACCENT_GREEN,
         "Network flows generated in bursts exhibit temporal and device-level autocorrelation. When records are not strictly independent and identically distributed (i.i.d.), standard inferential tests can yield overly optimistic p-values."),
        ("4. Aggregated Flow Logging (Zeek vs Packets)", TEXT_PRIMARY,
         "Zeek logs aggregate bidirectional flow statistics over session intervals rather than raw packet arrival timestamps. This restricts fine-grained packet-level inter-arrival sequence analysis without raw PCAP captures.")
    ]

    coords = [
        (Inches(0.8), Inches(1.5)),
        (Inches(0.8) + w2 + gap_x, Inches(1.5)),
        (Inches(0.8), Inches(1.5) + h2 + gap_y),
        (Inches(0.8) + w2 + gap_x, Inches(1.5) + h2 + gap_y)
    ]

    for (title, col, body), (x, y) in zip(limitations, coords):
        add_card(slide11, x, y, w2, h2)
        tb = slide11.shapes.add_textbox(x + Inches(0.15), y + Inches(0.12), w2 - Inches(0.3), h2 - Inches(0.24))
        tf = tb.text_frame
        tf.word_wrap = True

        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = col

        p_b = tf.add_paragraph()
        p_b.text = body
        p_b.font.size = Pt(10)
        p_b.font.color.rgb = TEXT_SECONDARY
        p_b.space_before = Pt(6)

    set_speaker_notes(slide11,
        "A hallmark of sound data science is intellectual honesty about limitations. "
        "First, we explicitly state that protocol comparisons are observational, not randomized A/B experiments. "
        "Second, our model reflects offline testbed separability and may not generalize to unseen enterprise networks. "
        "Third, network flow bursts exhibit clustering, which can understate inferential uncertainty. "
        "Acknowledging these constraints demonstrates mature academic practice."
    )

    # =========================================================================
    # SLIDE 12: Evidence-Based Conclusions & Future Roadmap
    # =========================================================================
    slide12 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide12)
    add_header(slide12, "Evidence-Based Conclusions & Future Roadmap", "Project Synthesis & Impact", 12)

    # Left Container: Synthesis of Findings
    add_card(slide12, Inches(0.8), Inches(1.5), Inches(5.6), Inches(5.3))
    tb12_l = slide12.shapes.add_textbox(Inches(1.0), Inches(1.7), Inches(5.2), Inches(4.9))
    tf12_l = tb12_l.text_frame
    tf12_l.word_wrap = True

    p = tf12_l.paragraphs[0]
    p.text = "CORE EVIDENCE-BASED CONCLUSIONS"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = ACCENT_GREEN

    conclusions = [
        ("1. Temporal & Volumetric Fingerprints: ", "Normal IoT devices (e.g. MQTT) maintain long-lived sessions (median ~44s) with small bidirectional payloads. Attacks exhibit millisecond durations with unidirectional flooding."),
        ("2. The Myth of the Gaussian Assumption: ", "Extreme right-skewness and zero-inflation confirmed that non-parametric methods are mandatory for network telemetry."),
        ("3. Statistical Survival Under FDR: ", "All 11 inferential hypotheses maintained significance under Benjamini-Hochberg adjustment (p_adj < 0.0001), establishing robust statistical separability."),
        ("4. Machine Learning Viability: ", "Cost-sensitive Random Forest achieved Macro-F1 = 0.9338, confirming high multiclass discriminative power when class weights are appropriately balanced.")
    ]
    for title, desc in conclusions:
        p = tf12_l.add_paragraph()
        p.space_before = Pt(10)
        rb = p.add_run()
        rb.text = title
        rb.font.bold = True
        rb.font.color.rgb = TEXT_PRIMARY
        rb.font.size = Pt(10.5)
        rt = p.add_run()
        rt.text = desc
        rt.font.color.rgb = TEXT_SECONDARY
        rt.font.size = Pt(10.5)

    # Right Container: Future Roadmap
    add_card(slide12, Inches(6.8), Inches(1.5), Inches(5.733), Inches(5.3))
    tb12_r = slide12.shapes.add_textbox(Inches(7.0), Inches(1.7), Inches(5.3), Inches(4.9))
    tf12_r = tb12_r.text_frame
    tf12_r.word_wrap = True

    p = tf12_r.paragraphs[0]
    p.text = "FUTURE ENHANCEMENTS ROADMAP"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = ACCENT_CYAN

    roadmap = [
        ("Cross-Dataset Validation: ", "Test the pre-trained Random Forest model on independent benchmarks (e.g. BoT-IoT, TON_IoT) to evaluate cross-environment generalization."),
        ("Deep Sequential Architectures: ", "Implement Temporal Convolutional Networks (TCN) and Transformers to evaluate raw packet sequences without manual flow aggregation."),
        ("Live Inline SOC Sniffing: ", "Integrate live libpcap packet capture streaming into the DuckDB engine for real-time edge intrusion detection."),
        ("Zero-Day Anomaly Detection: ", "Incorporate unsupervised autoencoders and Isolation Forests to flag zero-day attacks with no prior training labels.")
    ]
    for title, desc in roadmap:
        p = tf12_r.add_paragraph()
        p.space_before = Pt(10)
        rb = p.add_run()
        rb.text = title
        rb.font.bold = True
        rb.font.color.rgb = TEXT_PRIMARY
        rb.font.size = Pt(10.5)
        rt = p.add_run()
        rt.text = desc
        rt.font.color.rgb = TEXT_SECONDARY
        rt.font.size = Pt(10.5)

    set_speaker_notes(slide12,
        "In conclusion, IoT PULSE demonstrates that statistical data science and domain knowledge must go hand in hand. "
        "Normal smart sensors exhibit persistent bidirectional dialogues, while attacks exhibit rapid, asymmetric bursts. "
        "By applying non-parametric inference, False Discovery Rate control, and cost-sensitive ensemble modeling, "
        "we successfully uncovered the statistical patterns separating normal traffic from threats. "
        "Thank you, and we now welcome any questions from the panel."
    )

    output_path = "IoT_PULSE_Presentation_12_Slides.pptx"
    prs.save(output_path)
    print(f"Successfully generated 12-slide presentation at: {output_path}")

if __name__ == "__main__":
    build_presentation()
