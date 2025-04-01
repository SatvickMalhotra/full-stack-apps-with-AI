import pandas as pd
path = "/content/data_with_pincodeee.csv"
data_1 = pd.read_csv(path)
data_1.info()
data_1.columns
import firebase_admin
from firebase_admin import credentials, db
import pandas as pd

# Path to your service account key
service_account_path = #service account key here 
# Initialize Firebase
def initialize_firebase():
    try:
        # Initialize app only if it hasn't been initialized
        if not firebase_admin._apps:
            cred = credentials.Certificate(service_account_path)
            firebase_admin.initialize_app(cred, {
                'databaseURL': 'link'
            })
            print("Connected to Firebase successfully!")
        else:
            print("Firebase already initialized.")
    except Exception as e:
        print(f"Error during Firebase initialization: {e}")

# Call the function
initialize_firebase()


#uploading the data here 
def upload_data_to_firebase(csv_path):
    try:
        # Load the CSV into a DataFrame
        data_1 = pd.read_csv(csv_path)

        # Reference to the database
        ref = db.reference('clinic_data')

        # Convert each row to a dictionary and upload to Firebase
        for _, row in data_1.iterrows():
            clinic_data = {
                'State': row['State'],
                'Clinic Code': row['Clinic Code'],
                'Latitude': row['Latitude'],
                'Longitude': row['Longitude'],
                'Pincode': row['pincode']
            }
            # Push data to Firebase
            ref.push(clinic_data)
        print("Data uploaded successfully!")
    except Exception as e:
        print(f"Error during data upload: {e}")

# Provide the CSV path and call the function
csv_path = '/content/data_with_pincodeee.csv' #path to the csv file which you are using here
upload_data_to_firebase(csv_path)
