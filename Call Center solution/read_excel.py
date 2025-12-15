import pandas as pd
import sys

# Read the Excel file
excel_file = r"C:\Users\Lenovo\Downloads\for dashborard.xlsx"

try:
    # Get all sheet names
    xls = pd.ExcelFile(excel_file)
    print(f"Sheet names: {xls.sheet_names}\n")
    print("=" * 80)

    # Read each sheet
    for sheet_name in xls.sheet_names:
        print(f"\n{'='*80}")
        print(f"SHEET: {sheet_name}")
        print(f"{'='*80}\n")

        df = pd.read_excel(excel_file, sheet_name=sheet_name)

        # Print the dataframe
        print(df.to_string())
        print("\n")

except Exception as e:
    print(f"Error reading Excel file: {e}")
    sys.exit(1)
