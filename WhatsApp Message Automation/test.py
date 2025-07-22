import mysql.connector
from minsureconfig import *
# from templates import TEMPLATES
import requests
import datetime
import time
import logging
import sys

input_connect = mysql.connector.connect(
    host = DB_HOST_IN,
    user = DB_USER_IN,
    password = DB_PWD_IN,
    database = DB_DATABASE_INPUT
)
cursor_input = input_connect.cursor()


def fetch_message_details(type_str, lim = 100):
    query = (
                "SELECT id,whatsapp_no, msg_template, variables FROM whatsapp_queue where sent_flag is false and whatsapp_flag is true "
                "  and type in " + type_str + "and try_count < 5 limit " + str(lim))
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


def update_message_sent_status(message_id, response_id):
    now = datetime.datetime.now()
    # req_id = response['messages'][0]['id']  # Extract message ID from response
    update_query = """UPDATE whatsapp_queue SET sent_flag = TRUE, try_count= try_count+1, last_mod_date = NOW(),
      req_id = %s WHERE id = %s"""
    cursor_input.execute(update_query, (response_id, message_id))
    input_connect.commit()
    cursor_input.close()
    input_connect.close()


def update_message_failure_status(message_id):
    cursor = input_connect.cursor()
    now = datetime.datetime.now()
    update_query = """UPDATE whatsapp_queue SET try_count = try_count + 1, last_mod_date = NOW(),
                    version = version + 1 WHERE id = %s"""
    cursor.execute(update_query, message_id)
    input_connect.commit()
    cursor.close()
    input_connect.close()


def send_whatsapp_message2(to_phone, phone_number_id, message, access_token):
    # Define the API endpoint URL with the provided phone number ID.
    url = f"https://graph.facebook.com/v18.0/{phone_number_id}/messages"

    # Set up the headers for authorization and content type.
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    # Construct the data payload for a text message.
    data = {
        "messaging_product": "whatsapp",
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
    url = f"https://graph.facebook.com/v18.0/{phone_number_id}/messages"
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
            }]
        }
    }
    response = requests.post(url, headers = headers, json = data)
    return response.json()


def send_whatsapp_message_with_variables2(to_phone, temp_name, variables):
    # The updated URL for sending messages
    url = "https://wb.omni..com/whatsapp-cloud/"

    variables_list = variables.split('|')

    headers = {
        "Authorization": auth_token,
        "Content-Type": "application/json",
        "accept": "application/json"
    }

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

    response = requests.post(url, headers = headers, json = data)
    return response.json()


if __name__ == '__main__':
    av = sys.argv
    if len(av) > 1:
        typeSMS = True
        typeStr = "("
        for i in range(1, len(av)):
            if i == 1:
                typeStr = typeStr + " '" + av[i] + "'"
            else:
                typeStr = typeStr + ", '" + av[i] + "'"
        typeStr = typeStr + ")"
    else:
        typeSMS = False
        typeStr = False

    print(typeStr, typeSMS)
    # exit()
    while True:
        messages = fetch_message_details(typeStr)
        if messages:
            for message in messages:
                try:

                    (id, to_phone, template_name, variables) = message
                    #response = send_whatsapp_message_with_variables2(to_phone = to_phone, temp_name = template_name,
                    #                                                 variables = variables)
                    response = send_whatsapp_message_with_variables2(to_phone = '', temp_name = 'test',
                                                                     variables = '| ||xxybd|+')
                    if response.status_code == 200:
                        response_data = response.json()
                        logging.info(message)
                        message_id_from_response = response_data.get('id')
                        update_message_sent_status(message_id = id, response_id = message_id_from_response)
                    else:
                        logging.error(
                            f"Error: {to_phone} , template {template_name}."
                            f" Status code: {response.status_code}, Response: {response.text}")
                        update_message_failure_status(message_id = id)
                except Exception as e:
                    logging.error("Error occurred: ", e, exc_info = True)
        else:
            logging.info("No messages to send.")
            time.sleep(30)
