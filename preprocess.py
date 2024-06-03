import pandas as pd
import numpy as np

# Load the CSV file
file_path = 'visualizer.csv'
data = pd.read_csv(file_path)

# Function to generate a random two-decimal point number that rounds to the original one-decimal point number
def generate_two_decimal(original):
    lower_bound = original - 0.05
    upper_bound = original + 0.05
    random_value = round(np.random.uniform(lower_bound, upper_bound), 2)
    return random_value

# Apply the function to the user_review column
data['user_review_two_decimal'] = data['user_review'].apply(lambda x: generate_two_decimal(x))

# Save the modified dataframe to a new CSV file
output_path = 'visualizer_preprocess.csv'
data.to_csv(output_path, index=False)

data.head()
