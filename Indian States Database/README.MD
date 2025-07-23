# Comprehensive Indian Postal Code Directory 🇮🇳

A detailed and structured dataset of all postal offices across India, including their location, hierarchy, and precise latitude/longitude coordinates. This repository aims to be a go-to resource for developers, data scientists, and businesses needing accurate Indian postal data.

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Format](https://img.shields.io/badge/Format-CSV-brightgreen.svg)
![Records](https://img.shields.io/badge/Records-150,000%2B-orange.svg) 
<!-- You can update the record count badge if you know the exact number! -->

---

## 🚀 Overview & Key Features

This dataset provides a complete dump of the Indian Postal Service network. It goes beyond simple Pincode-to-City mapping by providing granular details for each post office.

*   **📍 Geospatial Data:** Includes **latitude and longitude** for nearly every post office, perfect for mapping and distance-based analysis.
*   **🗂️ Hierarchical Structure:** Details the full postal hierarchy from State down to the specific Branch Office (`statename` > `circlename` > `regionname` > `divisionname`).
*   **✅ Comprehensive Coverage:** Contains data for all states and union territories in India.
*   **📊 Rich Attributes:** Specifies the type of post office (e.g., Head Office, Sub Office) and whether it's a delivery office.
*   **💻 Developer-Friendly:** Provided in a clean, easy-to-parse CSV format.

---

## 📁 Dataset Structure

The dataset is contained in a single CSV file with the following columns:

| Column Name   | Description                                                                                             | Example                                   |
|---------------|---------------------------------------------------------------------------------------------------------|-------------------------------------------|
| `circlename`  | The top-level postal circle, usually corresponding to a state.                                          | `Maharashtra Circle`                      |
| `regionname`  | The postal region within a circle. Not all circles have regions.                                        | `Mumbai`                                  |
| `divisionname`| The postal division within a region, a key operational unit.                                            | `Mumbai  North East`                      |
| `officename`  | The official name of the post office.                                                                   | `Bhandup West S.O`                        |
| `pincode`     | The 6-digit Postal Index Number. This is the primary key for many lookups.                              | `400078`                                  |
| `officetype`  | The type of post office. (e.g., `HO`: Head Office, `SO`: Sub-Office, `BO`: Branch Office).               | `SO`                                      |
| `delivery`    | Indicates if the office handles mail delivery. (`Delivery` or `Non-Delivery`).                            | `Delivery`                                |
| `district`    | The administrative district where the post office is located.                                           | `Mumbai`                                  |
| `statename`   | The state or union territory where the post office is located.                                          | `MAHARASHTRA`                             |
| `latitude`    | The geographic latitude of the post office. Can be `NA` for some entries.                               | `19.1593`                                 |
| `longitude`   | The geographic longitude of the post office. Can be `NA` for some entries.                              | `72.9339`                                 |

---

## 💡 Potential Use Cases

This dataset can power a wide variety of applications and analyses:

*   **E-commerce & Logistics:**
    *   Pincode serviceability checks.
    *   Shipping and delivery zone calculation.
    *   Address validation and auto-completion forms.
    *   Finding the nearest post office to a customer.
*   **Data Science & Analytics:**
    *   Mapping the density of the postal network across the country.
    *   Analyzing service reach in urban vs. rural areas.
    *   Geospatial analysis when combined with demographic or economic data.
*   **Web & Mobile Development:**
    *   Creating Pincode lookup tools and APIs.
    *   Powering location-based services.
    *   Autofill forms for user registration and checkout pages.

---

## 🚀 Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/[your-username]/[your-repo-name].git
    ```

2.  **Access the Data:**
    Navigate to the project directory and you will find the main CSV file. You can load this file into any programming language (Python with Pandas, R, etc.) or database system.

    **Example using Python Pandas:**
    ```python
    import pandas as pd

    # Load the dataset
    df = pd.read_csv('indian_pincode_database.csv') #<- Make sure the filename is correct

    # Display the first 5 rows
    print(df.head())

    # Find all post offices in a specific pincode
    pincode_info = df[df['pincode'] == 400078]
    print(pincode_info)
    ```

---

## 🙏 Contributing

This dataset is compiled from publicly available sources. However, errors or updates can occur. If you find any inaccuracies or have suggestions for improving the dataset, please feel free to:

1.  **Open an Issue:** Report any errors or inconsistencies you find.
2.  **Submit a Pull Request:** If you have corrected or added data, please submit a PR!

Your contributions are welcome and will benefit everyone using this data.

---

## 📄 License

This dataset is made available under the **MIT License**. You are free to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the data. See the [LICENSE.md](LICENSE.md) file for more details.
