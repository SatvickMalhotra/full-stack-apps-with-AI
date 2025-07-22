import mysql.connector
from minsureconfig import *
# from templates import TEMPLATES
import requests


def fetch_message_details(lim = 100):
    input_connect = mysql.connector.connect(
        host = DB_HOST_IN,
        user = DB_USER_IN,
        password = DB_PWD_IN,
        database = DB_DATABASE_INPUT
    )
    cursor_input = input_connect.cursor()
    query = "SELECT mobile_no, template_id, variables FROM whatsapp_queue where sent_flag is false and try_count < 2 limit " + str(
        lim)
    cursor_input.execute(query)
    rows = cursor_input.fetchall()
    cursor_input.close()
    input_connect.close()
    return rows


def send_whatsapp_message(to_phone, phone_number_id, temp_name, access_token, variables = None):
    # message = makeSMS(temp_name, variables)

    url = f"https://graph..com/v18.0/{phone_number_id}/messages"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    data = {
        "messaging_product": "whatsapp",
        "to": f"91{to_phone}",
        "type": "template",
        "template": {
            "name": temp_name,
            "language": {
                "code": "en"
            }
        }
    }
    response = requests.post(url, headers = headers, json = data)
    return response.json()


def send_whatsapp_message2(to_phone, phone_number_id, message, access_token):
    # Define the API endpoint URL with the provided phone number ID.
    url = f"https://graph..com/v18.0/{phone_number_id}/messages"

    # Set up the headers for authorization and content type.
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    # Construct the data payload for a text message.
    data = {
        "messaging_product": "whatsapp",
        "preview_url": False,
        "recipient_type": "individual",
        "to": f"91{to_phone}",
        "type": "text",
        "text": {
            "body": message
        }
    }

    # Make the HTTP POST request to the WhatsApp API.
    response = requests.post(url, headers = headers, json = data)

    # Return the JSON response from the API.
    return response.json()


def send_whatsapp_message_with_variables(to_phone, phone_number_id, temp_name, variables, access_token):
    url = f"https://graph..com/v18.0/{phone_number_id}/messages"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    # Split the variables string into a list based on the '|' separator
    variables = variables.split('|')
    print(variables)
    data = {
        "messaging_product": "whatsapp",
        "to": f"91{to_phone}",
        "type": "template",
        "template": {
            "name": temp_name,
            "language": {
                "code": "en"
            },
            "components": [{
                "type": "body",
                "parameters": [{"type": "text", "text": var} for var in variables]
            }
            ]
        }
    }
    response = requests.post(url, headers = headers, json = data)
    return response.json()


def send_whatsapp_message_with_variables2(to_phone, temp_name, variables):
    # The updated URL for sending messages
    url = "https://wb.omni..com/whatsapp-cloud/messages"

    variables_list = variables.split('|')
    print(variables)
    headers = {
        "accept": "application/json",
        "Authorization": auth_token,
        "Content-Type": "application/json"

    }
    # +91
    data = {
        "to": f"91{to_phone}",
        "type": "template",
        "source": "external",
        "template": {
            "name": temp_name,
            "language": {
                "code": "en"
            },
            "components": [
                {
                    "type": "body",
                    "parameters": [

                        {"type": "text", "text": var} for var in variables_list
                    ]
                }
            ]
        }
    }
    print(headers)
    print(data)
    response = requests.post(url, headers = headers, json = data)
    print(response.text)
    print(response.status_code)
    return response.json()


if __name__ == '__main__':
    # mobile_no, template_id, variables = fetch_message_details()
    
    # access_token = '')
    """
    response = send_whatsapp_message_with_variables(to_phone = '', phone_number_id = '',
                                                    temp_name = '',
                                                    variables = "| ||",
                                                    access_token = '')
    """

    response = send_whatsapp_message_with_variables2(to_phone = '', temp_name = 'test',
                                                     variables = '| ||abcde|')
    # response = send_whatsapp_message(mobile_no, message)
    print(response)
