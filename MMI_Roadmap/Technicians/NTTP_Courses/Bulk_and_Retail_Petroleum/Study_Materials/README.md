# NTTP Bulk & Retail Petroleum — course binder

Measurement Canada's course binder for authorized service providers, *Bulk and Retail Petroleum* (January 2021, "uncontrolled copy for training purposes only"). It was copied from the Google Drive folder **EN-BR-documents to print** on 2026-10-11. Files are in [`Course_Binder/`](Course_Binder/), in the binder's own order.

- **Originals:** 67 files copied byte-for-byte (Word and PDF).
- **Transcriptions:** 18 short PDFs (most of the small STPs and FIM Part 2 §4) are saved as Markdown text, each linking to its Drive original. They were too small to transfer as binaries.
- **Not copied:**
  - the two VCF tables, already in [`../Codebooks/`](../Codebooks/) and the same size as the Drive copies;
  - four small modification acceptance letters (MALs): AV-2188 v086 and v091, AV-2331 v119 and v119r1;
  - six empty "article 1-295" Google Docs and three duplicate copies of the Weights and Measures Act.

> This repo is public, so these files are publicly visible. Most are Measurement Canada publications that are already public. The module cover pages are MC training material.

---

## 1. What's in the binder

The course runs 5 days and ends in a theoretical evaluation. Candidates who pass then take a practical evaluation. Both need **70 %**, and the practical needs 70 % **in each category** (Module 1).

| # | Module | What it contains | Use to MMI |
|---|---|---|---|
| — | [Cover](Course_Binder/01_Cover_Page/), [Table of contents](Course_Binder/02_Table_of_Contents/) | Course title page and module list | — |
| 1 | [Introduction](Course_Binder/03_Module_01_Introduction/) | Course objectives, 5-day schedule, pass marks, Measurement Canada's mandate | Know the evaluation format |
| 2 | [Weights and Measures Act](Course_Binder/04_Module_02_Act/) | Course notes on the Act, plus the full Act (Word) | Legal basis: approval (s.8), offences, seals (s.30) |
| 3 | [Regulations 1–17](Course_Binder/05_Module_03_Regulations_1-17/) | Definitions, approvals, what a Notice of Approval contains (s.17) | Background |
| 4 | [Notices of Approval](Course_Binder/06_Module_04_Notices_of_Approval/) | How to read an NOA, with real examples: **AV-2372 Gilbarco Encore dispensers**, AV-2331 Gasboy truck refueller, AV-2188 Liquid Controls register, S.WA-0368 LC bulk meter, plus their modification letters | **High.** AV-2372 is the dispenser MMI will meet most. It gives the 6–45 L/min rating and how to enter **ATC inspection mode**, where the money display shows gross litres |
| 5 | [Regulations 18–295](Course_Binder/07_Module_05_Regulations_18-295/) | Local standards (s.56), limits of error (s.44, 263–270), meter installation rules (s.249–295) | **High.** Repeatability is s.263, dispenser limits are s.265, and s.258 requires a gross register on ATC meters |
| 6 | [Specifications](Course_Binder/08_Module_06_Specifications/) | Notes on the SVM-1 (electronic registers) and SVM-2 (ATC) specifications, plus SVM-1 itself | Sealing, pulsers, minimum increments, linearization ≤ 0.25 % |
| 7 | [Bulletins](Course_Binder/09_Module_07_Bulletins/) | 7 GEN and 21 V bulletins | **High:** V-03, V-17, V-18, V-19, V-23, V-24 (see §3) |
| 8 | [Care and use of standards](Course_Binder/10_Module_08_Temperature/) | TE-LP-001, preparing an ice-point bath | Monthly thermometer check (V-24) |
| 9 | [Inspection procedure outlines](Course_Binder/11_Module_09_Inspection_Procedures/) | **FIM Part 2 §1: dispensers (Types 50/51)**, §2 rack meters, §3 vehicle meters, §4 gravity truck meters | **The procedure for the practical evaluation** |
| 10 | [Standard test procedures](Course_Binder/12_Module_10_Standard_Test_Procedures/) | STP-1 to STP-24 and STP-37 | **High.** How each test is done and judged |
| 11 | [Role of ASPs](Course_Binder/13_Module_11_ASP_Role/) | MC enforcement policy, part 1 (authorized service providers) | Reporting duties, rejections, seized devices |
| 12 | [Terminology](Course_Binder/14_Module_12_Terminology/) | Glossary | Exam vocabulary |

---

## 2. The dispenser inspection in one page

From FIM Part 2 §1 and the STPs it calls. The [MMI Members app](https://nickprocenko.github.io/MMI/app/) Tests tab follows this sequence.

**Before testing**
- Read the device's Notice of Approval.
- Test measure: designated as a local standard, seals intact, no dents or cracked glass. 20 L **measures are re-certified yearly**; 20 L and 250 L **provers every 4 years**.
- Gasoline needs a recognized vapour-loss measure; diesel doesn't (V-24 §6.1).
- Electronic thermometer reading 0.1 °C, with an **ice-point check within the last 30 days** (V-24, TE-LP-001).
- Fix leaks before testing.

**Visual examination:** approval, markings including "volume corrected to 15 °C", seals, installation and piping, printers and tickets.

**Performance tests** (in IPO order):

| Test | Key numbers | Source |
|---|---|---|
| Wet the measure | Fill to nominal, empty, drain **20 s for 20 L** (10 s for 5 L) after the stream breaks to drips, unless the certificate says otherwise | STP-22 |
| Temperature | Stabilize within **±0.5 °C** of the mean by circulating product | FIM P2 §1 |
| Return to zero, interlock, segment | Pass/fail | STP-1, 2, 3 |
| Slow flow | **Minimum approved flow + 5 L/min** | STP-4 |
| Fast flow | Nozzle fully open, register in **gross mode**, at or below the approved maximum | STP-5, STP-21 |
| Error | Error = register − measure volume corrected for shell temperature, using V<sub>ref</sub> × CCE × (T − 15 °C), where CCE is 0.0000518/°C for 304 stainless. **Mandatory for all provers since 2020-04-01.** Example: a 20 L measure at 5 °C holds 10.4 mL less than it reads. | STP-23, V-17 |
| Limits | **±100 mL on 20 L** in service (±60 mL on 5 L). Acceptance limits (±50 / ±30 mL) apply only to factory/dealer initial inspections | Regs s.265, V-23, STP-12 |
| Repeatability | 3 consecutive fast runs, spread **≤ 2/5 of the in-service limit (40 mL on 20 L)**. Stop after 2 if they already differ by more. Required on initial inspections. In service on PD meters, required only if fast flow < 40 % of max or fast and slow differ by more than 2/5 | STP-7, s.263 |
| Check valve, roll-up, creep | Nozzle doesn't drain. Display stays at 0 for ≥ 10 s on start. No creep for 30 s after a fast run | STP-11 |
| Hose expansion (hose > 5 m), backlash | Within ±100 mL / 20 L | STP-12, STP-14 |
| Agreement, computed price | Displays, console and receipt agree. Price correct to the cent | STP-9, STP-10 |
| Prepay (initial/complaint only) | Stops at the preset, no more than 50 mL over | STP-17 |
| Cross-over, blend | Pass/fail | STP-15, STP-16 |
| **ATC** | A separate test, not a correction applied to accuracy runs. Run ≥ 20 L with the thermometer in the test well, reading it at 25/50/75/95 %. **Net ÷ gross must be within VCF(T+1 °C)…VCF(T−1 °C)** at 730 kg/m³ (gasoline) or 840 kg/m³ (diesel) | STP-18, V-18 |
| ATC sensor failure | Only with a service technician present | STP-19 |

**Multi-grade meters:** test the highest and lowest viscosity grades.

**After testing:** reseal and return the register to service mode. Report results through MC's **Online Reporting Application (ORA)**. Serious non-compliances (unapproved device, no initial inspection, and so on) must be reported **within 2 business days**, even if fixed (Module 11).

---

## 3. What this changed in MMI's notes and app

Checking MMI's existing material against the binder found these problems. All are fixed in the same change as this README.

| Was | Binder says | Fixed in |
|---|---|---|
| "30-second drain period" | **20 s for a 20 L measure** (STP-22), unless the measure's certificate says otherwise | [Equipment README](../../../../Equipment/README.md) |
| App applied the VCF to every accuracy draft | Accuracy runs are in **gross** mode against the shell-corrected measure (STP-5, R.258). The VCF tables are for the **separate ATC test** (STP-18) | App Tests tab |
| No prover shell correction ("not required for 20 L" in the 2012 FIM) | Required for **all** provers since 2020-04-01 (V-17 rev. 3, STP-23 rev. 3) | App Tests tab |
| Repeatability always checked on the last 3 drafts | Conditional on the STP-7 triggers, limit taken from the **in-service** limit, can fail after 2 runs | App Tests tab |
| "Acceptance (controlled)" offered for field tests | Field inspections always use in-service limits. Acceptance applies to factory/dealer initial inspections (V-23 §6) | App Tests tab |
| No functional tests or equipment checks | 19-item IPO checklist, plus ice-point and measure re-certification warnings | App Tests tab |

The extracted VCF tables check out against MC's own worked example. STP-18 gives 0.9912 for gasoline at 22 °C, and the table in the app gives the same.

---

## 4. Version cautions

- The binder is dated **January 2021**, and several documents inside it are older. The FIM Part 2 §1 copy is **revision 2 (2012)**. Measurement Canada published **revision 3 on 2025-10-10**. Get the current version before the practical evaluation and check for changes.
- STP-21 (2017), STP-23 (2019) and V-17 (2019/2020) are newer than the FIM Part 2 §1 copy and override its note that 20 L measures don't need a shell correction.
- Several documents point to things that aren't in the binder: *Guidelines for the Calibration and Certification of Volumetric Standards*, bulletins V-10, V-12 and V-13, the full SVM-2 text, and the extrapolated VCF tables.

---

## 5. Suggested study use before the April 2027 practical

1. Learn §2 above until the numbers are automatic: 100 / 40 mL, 20 s drain, minimum + 5 L/min, ±0.5 °C, ±1 °C VCF window, 30-day ice point.
2. Read the AV-2372 notice of approval end to end, especially the ATC inspection-mode codes and the sealing.
3. Work STP-7's and STP-18's worked examples by hand, then check them in the app's Tests tab.
4. During PM.1 field hours, run the full IPO sequence in the app on real dispensers (with the host's permission), as practice.
