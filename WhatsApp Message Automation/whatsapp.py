import mysql.connector
from minsureconfig import *
from whatsapptemplates import WHATSAPP_TEMPLATES
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

logging.basicConfig(level = logging.INFO, format = '%(asctime)s - %(message)s')


def get_cursor():
    input_connect = mysql.connector.connect(
        host=DB_HOST_IN,
        user=DB_USER_IN,
        password=DB_PWD_IN,
        database=DB_DATABASE_INPUT
    )
    return input_connect.cursor(), input_connect


def fetch_message_details(type_str,cursor, lim = 100):
    query = (
                "SELECT id,whatsapp_no, msg_template, variables FROM whatsapp_msg_queue where sent_flag is false "
                "  and type in " + type_str + " and coalesce(try_count,0) < 3 order by id desc limit " + str(lim))

    cursor.execute(query)
    rows = cursor.fetchall()
    return rows


def update_message_sent_status(message_id, response_id,temp_name):
    update_query = """UPDATE whatsapp_msg_queue SET sent_flag = TRUE,
    last_mod_date = NOW(), sent_on = NOW(),  req_id = %s , template_name = %s WHERE id = %s"""
    cursor_input.execute(update_query, (response_id,temp_name, message_id))
    input_connect.commit()


def update_message_failure_status(message_id,temp_name):
    cursor = input_connect.cursor()
    update_query = """UPDATE whatsapp_msg_queue SET try_count = COALESCE(try_count,0) + 1, last_mod_date = NOW(),
                     template_name = %s WHERE id = %s"""
    cursor.execute(update_query,temp_name, message_id)
    input_connect.commit()


def template_not_found(message_id):
    cursor = input_connect.cursor()
    update_query = """UPDATE whatsapp_msg_queue SET try_count = COALESCE(try_count,0) + 1, last_mod_date = NOW() WHERE id = %s"""
    cursor.execute(update_query, (message_id,))
    input_connect.commit()


def send_whatsapp_message_with_variables2(to_phone, temp_name, variables,language):

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
                "code": language
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
    return response


if __name__ == '__main__':
    av = sys.argv
    if len(av) > 1:
        typeSMS = True
        typeStr = "("
        for i in range(1, len(av)):
            if i == 1:
                typeStr = typeStr + "'" + av[i] + "'"
            else:
                typeStr = typeStr + ", '" + av[i] + "'"
        typeStr = typeStr + ")"
    else:
        typeSMS = False
        typeStr = False

    while True:
        cursor_input, input_connect = get_cursor()
        messages = fetch_message_details(typeStr,cursor_input)
        if messages:
            for message in messages:
                try:

                    (id, to_phone, template_name, variables) = message
                    template_info = WHATSAPP_TEMPLATES.get(template_name, [None, None])
                    actual_template_name, language = template_info[0], template_info[1]

                    if actual_template_name is None:
                        logging.error(f"ERROR : Template Not found {template_name} for id {id}")
                        template_not_found(id)
                        time.sleep(2)
                        continue

                    else:
                        response = send_whatsapp_message_with_variables2(to_phone = to_phone, temp_name = actual_template_name,
                                                                     variables = variables,language = language)

                        if response.status_code == 200:
                            response_data = response.json()
                            logging.info(message)
                            message_id_from_response = response_data.get('id')
                            update_message_sent_status(message_id = id, response_id = message_id_from_response,temp_name = actual_template_name)
                        else:
                            logging.error(
                                f"Error: {to_phone} , template {template_name}."
                                f" Status code: {response.status_code}, Response: {response.text}")
                            update_message_failure_status(temp_name = actual_template_name,message_id = id)
                except Exception as e:
                    logging.error("Error occurred: ", e, exc_info = True)
        else:
            logging.info("No messages to send,sleeping for 20 sec")
            time.sleep(20)

