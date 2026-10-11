# STP-18 — Automatic temperature compensator (ATC) test

> Text transcription of `STP-18.pdf` from the NTTP Bulk & Retail binder. The original PDF is in Google Drive: <https://drive.google.com/file/d/17-lzsm3ytulDOJ2i4ZpKP0l3fopPTa-P/view>. Measurement Canada's current version is in the [Field Inspection Manual — Volumetric](https://ised-isde.canada.ca/site/measurement-canada/en/laws-and-requirements/field-inspection-manual-volumetric-measuring-devices).

Field Inspection Manual Part: 3-STP Section: 18 · Volumetric Measuring Devices · Issued: 2010-04-01 · Revision: 1

## Performance — Automatic temperature compensator test

### Application
This test applies to any device that is equipped with a mechanical or electronic temperature compensator (ATC). ATCs are used on motor fuel dispensers and refuellers, propane dispensers and refuellers (mandatory), vehicle mounted meters for petroleum products and propane, loading rack meters for various non-heated petroleum product and chemicals, loading rack meters for heated products such as asphalt and heavy oil (bunker). ATCs must be approved either as a separate component or as an integral part of a register.

### Purpose
This procedure tests the ability of the ATC to make that conversion within the applicable limit of error.

### Description
An automatic temperature compensator is a device that adjusts the registration of a volumetric measurement to correspond to the volume that would have been registered if the product was at the base temperature, (temperature to which the ATC is set).

An ATC uses a probe which senses the product temperature; on mechanical systems by means of a hydraulic mechanism that reacts to change in temperature; and on electronic systems by means of a resistor or thermistor that varies according to changes in temperature.

In a mechanical ATC, the planetary system changes register drive speed proportionally to the difference between the temperature of the product and the base temperature (15°C for petroleum products). The ATC module in an electronic register performs the same function by choosing the appropriate correction factor corresponding to the temperature of the product or calculates a factor based on the pre-programmed expansion curve of the product.

Electronic devices can be set to display both gross and net volumes. Certain mechanical devices such as Liquid Control meters are installed with two (dual) mechanical registers; one that displays the gross volume and the other one displays the net volumes. They must be clearly differentiated. Certain older Neptune mechanical meters require the installation of a mechanical totaliser on the drive shaft.

### Test equipment and reference material
Electronic Thermometer with 0.1°C graduations or less. Certificate of accuracy for thermometer. Relevant ASTM-IP or API standards tables.

**Legislative references:** R.270, NoA, SVM.1-20, SVM.2-5, SVM.2-6, SVM.2-4, bulletin V-18.

### General set-up and pre-test determination
Verify that the compensator has been approved and is appropriate for the density and temperature range of the product to be measured. The necessary information is found in the Notice of Approval.

The reference temperature at which the compensation must be done is 15 Celcius degrees. Certain old mechanical ATCs still in service could reference 60 Fahrenheit degrees.

Fixed density values have been prescribed for retail dispensers, refuellers, and vehicle mounted meters used to measure gasoline (730 kg/m3), diesel (840 kg/m3) and commercial propane (510 kg/m3). Densities have also been prescribed for other liquids sold at the retail level. Consult the Measurement Canada bulletin V-18.

On loading rack meters, ATC densities can be set to correspond to the current density of the product. Density setting is a sealable parameter. Before proceeding to test these devices, the density at which they are set must be determined. Also, it must be confirmed that the set density match the current density of the product.

### Procedure for testing ATC on electronic devices and on mechanical devices equipped with dual registers
NOTE: The following ATC test procedure does not require the use of a test measure or a prover. The test can be performed during the filling of any containers, the filling of a car, the loading of a tanker truck, or when circulating the product back to the supply tank.

Remove the plug from the test well and fill the well with conducting paste or liquid. Do not use liquid that can freeze or readily evaporate.

Insert the thermometer into the test well before the volumetric tests are performed so that the temperature is stabilised. Make sure that the size of the well is appropriate (diameter and depth) for the type of thermometer used.

Set the device (electronic) to test mode (indicate and display in terms of the gross volume) where applicable. Mechanical dual registers display both net and gross constantly.

Proceed with the various volumetric tests as outlined in the Inspection Procedure Outlines for the various meter types. During the tests observe the thermometer display to assess temperature fluctuations.

As the thermometer was inserted in the well before the volumetric tests, the system temperature should be stabilized and temperature fluctuations minimized. If the temperature fluctuates more than ± 0.5°C of the mean (range of 1°C), an accurate test cannot be made. Circulate a sufficient quantity of product to stabilize temperature to within 1.0 °C. Note that the mechanical ATC response is normally very slow, taking as long as several minutes.

Example: A test is not considered valid until the temperatures observed during such a run are within ± 0.5°C of the average temperature calculated over the test, i.e., at 25% of the run's volume the temperature was 11.5°C; at 50% it was 12.2°C; at 75% it was 11.9°C and at 95% it was 12.0°C. Therefore, the average calculated is 11.9°C and this test run may be considered valid and temperature stable because it remained within 11.4°C and 12.4°C (1°C) or in other words, ± 0.5°C of the mean temperature (11.9°C).

*Revised April 2010*

Reset the meter register (both registers in the case of dual mechanical registers) to zero immediately and circulate a quantity of product equal to at least 2000 times the instrument's minimum graduation as defined by SVM.1-20.

Record precisely the temperature taken from the electronic thermometer (standard) at 25%, 50%, 75%, and 95% of the test volume.

Record precisely the net and gross readings.

Establish the average (mean) temperature taking into account the thermometer's correction (see Certificate of Calibration).

Calculate the actual VCF: net volume displayed / gross volume displayed

Find and record the theoretical VCF in the appropriate section of API or ASTM-IP Tables, corresponding to the average temperature registered and using the density for which the ATC is set.

Remove the thermometer from the well, put the cap or plug on. Reset the instrument to service mode and seal it. Verify that the device is working in the service mode.

### Interpretation of results and example for electronic ATC
Compare the actual to the theoretical VCF. The difference between the two must be equal to or smaller than the value representing 1°C (in-service limit of error).

NOTE: For test performed on site, always apply in-service LOE.

EXAMPLE 1: Calculation of the in-service limits of error for an electronic ATC used on Gasoline dispensers. The density is 730 kg/m3

- Average temperature of the test = 22°C
- VCF API Table 54B (730 kg/m3) at 22°C = 0.9912
- Gross reading = 22 litres
- Net reading = 21.92 litres
- Actual volume correction factor = Net / Gross = 21.92 / 22 = .99636

LOE in terms of factors. The actual factor must be within the range of VCF (23°C) to VCF (21°C), or between 0.99 and 0.9925. The above dispenser fails the test.

### Interpretation of results and examples for mechanical automatic temperature compensator
Determine the average temperature from the readings taken during the test. Look up the volume reduction factor, for the product being delivered, in the appropriate ASTM API tables. Compare with the value marked on the compensator. Determine the average temperature (mid-point) of the compensator (see the compensator serial plate or consult the Notice of Approval).

NOTE: For ATCs approved and used on propane, 15°C is always used as the mid-point.

Determine the difference between the mid-point temperature and the test temperature to obtain ΔT.

Example 2: ΔT value determination

- Approved temperature range marked on the ATC = −30 to +40°C
- Mid-point temperature of the ATC = ((−30) + (+40)) / 2 = 5°C
- Recorded test temperature = 25°C
- ΔT = 25°C − 5°C = 20°C

NOTE: Except for liquified gases, ΔT must never exceed 15°C when calculating the limit of error.

Calculate the limit of error (LOE) using the formula given in the applicable table of Section 270 of the Weights and Measures Regulations.

NOTE: All limits of error quoted in the following examples are for in-service verification.

NOTE: On mechanical ATC, the density indicated on the name plate of the compensator must be used. However, the ATC must be set for a density that is appropriate for the product measured. The Notice of Approval may grant exemptions. Consult NOA.

EXAMPLE 3: Calculation of the in-service limits of error for an ATC used on liquified petroleum gas; the density marked on the ATC nameplate is 510 kg/m3

- Mid-range for propane ATCs (always) = 15°C
- Average temperature of the test = 5°C
- VCF ASTM-IP Table 54, D1250 (510 kg/m3) at 5°C = 1.028
- ΔT = 15°C − 5°C = 10°C
- LOE(−) = VCF − 0.0020 − (0.00036 × ΔT) = 1.028 − 0.0020 − (0.00036 × 10) = 1.0224
- LOE(+) = VCF + 0.0020 + (0.00018 × ΔT) = 1.028 + 0.0020 + (0.00018 × 10) = 1.0318

For a test of 400 litres (gross) the net registration must be within the following values:

- Upper Acceptable Value (+) = 400 L × 1.0318 = 412.72 L
- Exact Value = 400 L × 1.028 = 411.2 L
- Lower Acceptable Value (−) = 400 L × 1.0224 = 408.96 L

EXAMPLE 4: Calculation of the in-service limits of error for an ATC used on Bunker oil; the density marked on the ATC nameplate is 996 kg/m3.

- Temperature range marked on the ATC nameplate: +40°C to 110°C
- Mid-range compensator = 75°C
- Average temperature of the test = 63°C
- VCF API Table 54A (996 kg/m3) at 63°C = 0.9700
- ΔT = 75°C − 63°C = 12°C (NOTE: the maximum difference used for calculation is 15°C)
- LOE(−) = VCF − 0.0020 − (0.00036 × ΔT) = 0.9700 − 0.0020 − (0.00036 × 12) = 0.96368
- LOE(+) = VCF + 0.0020 + (0.00018 × ΔT) = 0.9700 + 0.0020 + (0.00018 × 12) = 0.97416

For a test of 2000 litres (gross) the net registration must be within the following values:

- Upper Acceptable Value (+) = 2000 L × 0.97416 = 1948.32 L
- Exact Value = 2000 L × 0.9700 = 1940 L
- Lower Acceptable Value (−) = 2000 L × 0.96368 = 1927.36 L

### Revision 1
Revised April 2010. The procedure was revised to correct a typo error and further clarify the product temperature stabilisation requirements. An example was also introduced to illustrate how to determine when a test run is temperature stable and may be considered valid. The original procedure, developed during the mid 1980s, had the requirement for stability to be within ± 0.5 °C. It had been noted this way or as 1.0 °C in all documents including training manuals, previous STPs and handouts until this new version of the Field Inspection Manual was developed omitting the "±" upon release.
