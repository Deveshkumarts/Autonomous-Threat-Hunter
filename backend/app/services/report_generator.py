import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from sqlalchemy.orm import Session
from .. import models, crud
from .risk_engine import evaluate_employee_risk

def generate_forensic_report(db: Session, employee_id: str) -> io.BytesIO:
    # Gather Data
    employee = crud.get_employee(db, employee_id)
    if not employee:
        raise ValueError("Employee not found")
        
    risk_response = evaluate_employee_risk(db, employee_id)
    
    # Recent logs
    logs = db.query(models.LogEvent).filter(
        models.LogEvent.employee_id == employee_id
    ).order_by(models.LogEvent.timestamp.desc()).limit(15).all()
    
    # Recent responses
    responses = db.query(models.ResponseHistory).filter(
        models.ResponseHistory.employee_id == employee_id
    ).order_by(models.ResponseHistory.timestamp.desc()).limit(5).all()

    # Create PDF buffer
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    
    styles = getSampleStyleSheet()
    title_style = styles['Heading1']
    title_style.alignment = 1 # Center
    title_style.textColor = colors.HexColor("#0B1120")
    
    h2_style = styles['Heading2']
    h2_style.textColor = colors.HexColor("#1e3a8a")
    
    normal_style = styles['Normal']
    
    story = []
    
    # Title
    story.append(Paragraph("<b>AUTONOMOUS THREAT HUNTER</b>", title_style))
    story.append(Paragraph("<b>Forensic Investigation Report</b>", title_style))
    story.append(Spacer(1, 20))
    
    # 1. Employee Information
    story.append(Paragraph("1. Employee Information", h2_style))
    emp_data = [
        ["Employee ID", employee.id],
        ["Name", employee.name],
        ["Department", employee.department],
        ["Report Generated", datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")]
    ]
    t = Table(emp_data, colWidths=[150, 300])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor("#f1f5f9")),
        ('TEXTCOLOR', (0,0), (-1,-1), colors.black),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
    ]))
    story.append(t)
    story.append(Spacer(1, 15))
    
    # 2. Risk Score & AI Explanation
    story.append(Paragraph("2. Risk Assessment", h2_style))
    risk_color = colors.red if risk_response.risk_level in ["High", "Critical"] else (colors.orange if risk_response.risk_level == "Medium" else colors.green)
    story.append(Paragraph(f"<b>Total Risk Score:</b> <font color='{risk_color.hexval()}'>{risk_response.total_score}</font> ({risk_response.risk_level})", normal_style))
    story.append(Spacer(1, 10))
    
    story.append(Paragraph("<b>Indicators of Compromise (IoCs):</b>", normal_style))
    if not risk_response.breakdown:
        story.append(Paragraph("- No significant indicators found.", normal_style))
    else:
        for item in risk_response.breakdown:
            story.append(Paragraph(f"- <b>+{item.score}</b>: {item.reason}", normal_style))
            
    story.append(Spacer(1, 15))
    
    # 3. Triggered Automated Rules
    story.append(Paragraph("3. Autonomous Security Responses", h2_style))
    if not responses:
        story.append(Paragraph("No automated actions have been triggered.", normal_style))
    else:
        resp_data = [["Timestamp", "Risk Score", "Actions Triggered"]]
        for r in responses:
            resp_data.append([
                r.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                str(r.risk_score),
                r.triggered_actions
            ])
        t_resp = Table(resp_data, colWidths=[120, 70, 260])
        t_resp.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#ef4444")),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
        ]))
        story.append(t_resp)
        
    story.append(Spacer(1, 15))
    
    # 4. MITRE ATT&CK Mapping (Heuristic based on IoCs)
    story.append(Paragraph("4. MITRE ATT&CK Mapping", h2_style))
    mitre_data = [["Technique ID", "Technique Name", "Evidence"]]
    
    for item in risk_response.breakdown:
        reason = item.reason.lower()
        if "login outside" in reason or "new device" in reason:
            mitre_data.append(["T1078", "Valid Accounts", item.reason])
        if "downloaded abnormal" in reason:
            mitre_data.append(["T1039", "Data from Network Shared Drive", item.reason])
        if "external upload" in reason:
            mitre_data.append(["T1567", "Exfiltration Over Web Service", item.reason])
        if "usb" in reason:
            mitre_data.append(["T1052", "Exfiltration Over Physical Medium", item.reason])
            
    if len(mitre_data) == 1:
        mitre_data.append(["-", "No specific techniques mapped", "-"])
        
    t_mitre = Table(mitre_data, colWidths=[80, 170, 200])
    t_mitre.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#334155")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
    ]))
    story.append(t_mitre)
    story.append(Spacer(1, 15))
    
    # 5. Timeline
    story.append(Paragraph("5. Recent Activity Timeline", h2_style))
    if not logs:
        story.append(Paragraph("No recent logs found.", normal_style))
    else:
        timeline_data = [["Time", "Activity", "Severity"]]
        for log in logs:
            timeline_data.append([
                log.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                log.activity,
                log.severity
            ])
        t_timeline = Table(timeline_data, colWidths=[120, 250, 80])
        t_timeline.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#334155")),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
        ]))
        story.append(t_timeline)
        
    story.append(Spacer(1, 15))
    
    # 6. Recommended Actions
    story.append(Paragraph("6. Recommended Actions", h2_style))
    if risk_response.total_score > 60:
        story.append(Paragraph("• Isolate the user's workstation immediately.", normal_style))
        story.append(Paragraph("• Reset corporate network credentials.", normal_style))
        story.append(Paragraph("• Conduct a mandatory HR and Security interview with the employee.", normal_style))
    elif risk_response.total_score > 30:
        story.append(Paragraph("• Assign analyst to manually review session recordings.", normal_style))
        story.append(Paragraph("• Escalate monitoring priority.", normal_style))
    else:
        story.append(Paragraph("• No immediate action required. Resume standard monitoring.", normal_style))
        
    # Build PDF
    doc.build(story)
    buffer.seek(0)
    return buffer
