from pymongo import MongoClient
import pprint
import time
from datetime import datetime
import threading 
import json
import os
import subprocess
from subprocess import CalledProcessError
from decouple import config


import base64
import hashlib
from Crypto.Cipher import AES
from Crypto import Random
from hashlib import md5


client = MongoClient('mongodb://localhost:27017/')
db = client.ImapSyncApp
basic_imap = db.basic_imap

BLOCK_SIZE = 16

def pad(data):
    length = BLOCK_SIZE - (len(data) % BLOCK_SIZE)
    return data + (chr(length)*length).encode()

def unpad(data):
    return data[:-(data[-1] if type(data[-1]) == int else ord(data[-1]))]

def bytes_to_key(data, salt, output=48):
    assert len(salt) == 8, len(salt)
    data += salt
    key = md5(data).digest()
    final_key = key
    while len(final_key) < output:
        key = md5(key + data).digest()
        final_key += key
    return final_key[:output]

def encrypt(message, passphrase):
    salt = Random.new().read(8)
    key_iv = bytes_to_key(passphrase, salt, 32+16)
    key = key_iv[:32]
    iv = key_iv[32:]
    aes = AES.new(key, AES.MODE_CBC, iv)
    return base64.b64encode(b"Salted__" + salt + aes.encrypt(pad(message)))

def decrypt(encrypted, passphrase):
    encrypted = base64.b64decode(encrypted)
    assert encrypted[0:8] == b"Salted__"
    salt = encrypted[8:16]
    key_iv = bytes_to_key(passphrase, salt, 32+16)
    key = key_iv[:32]
    iv = key_iv[32:]
    aes = AES.new(key, AES.MODE_CBC, iv)
    return unpad(aes.decrypt(encrypted[16:]))

def get_decrypted(to_decrypt):
    password = config('SECRET_ECRYPT_KEY').encode()

    result = decrypt(to_decrypt, password )

    return result.decode('utf-8')


def imap_sync(imap, time):

    current_time = time.strftime("%Y%m%d_[%H:%M:%S]_")
    
    email = get_decrypted(imap["email"])

    origin_IP = get_decrypted(imap["origin_IP"])
    origin_password = get_decrypted(imap["origin_password"])
    
    destination_IP = get_decrypted(imap["destination_IP"])
    destination_password = get_decrypted(imap["destination_password"])
    
    
    cmd = "imapsync --host1 " + origin_IP + " --user1 " + email + " --password1 '" + origin_password + "' --host2 " + destination_IP +\
         " --user2 "+ email + " --password2 '" + destination_password + "' --logfile " + current_time + imap["username"] + ".log"
    
    
    try:
        retured_value = subprocess.check_output(cmd, shell=True)
        basic_imap.update_one({'_id':imap["_id"]}, {"$set": {"status": "Done"}})
    except CalledProcessError as e:
        basic_imap.update_one({'_id':imap["_id"]}, {"$set": {"status": "Error"}})
    
   # print(threading.current_thread().getName(), 'Done')

active_threads = []

def current_threads():
    while(True):
        now = datetime.now()
        current_time = now.strftime("%d-%m-%Y - [%H:%M:%S]")
        if len(active_threads) == 0:
            print(current_time + ' - ' + 'No Threads active')
        else:
            for thread in active_threads:
                if(thread.isAlive() == False):
                    active_threads.remove(thread)
                    print(current_time + ' - ' + 'Thread '+ thread.getName() + ' has finished')
                else:
                    print(current_time + ' - ' + 'Thread '+ thread.getName() + ' is active')
        
        time.sleep(240)

thr = threading.Thread(target=current_threads, name="current_threads")
thr.start()
    
while(True):
    now = datetime.now()
    current_time = now.strftime("%d-%m-%Y - [%H:%M:%S]")
    
    if basic_imap.count_documents({"status": "In Queue"}) != 0:

        emails_to_migrate = basic_imap.find({"status": "In Queue"})

        for _imap in emails_to_migrate:
            
            print(current_time + ' - ' + ' One or more to Migrate')
            if(len(active_threads) < 5):

                if any(th.getName() == _imap["username"] for th in active_threads ) == False:
                    basic_imap.update_one({'_id':_imap["_id"]}, {"$set": {"status": "Working"}})
                    t = threading.Thread(target=imap_sync, args=(_imap,now,), name=_imap["username"])
                    active_threads.append(t)
                    t.start()
                    print(current_time + ' - ' + "Starting with " + _imap['username'])
                else:
                    print(current_time + ' - ' + "Already Working on it")
            else:
                print(current_time + ' - ' + "Threads are full")
            
            time.sleep(2)
                
    else:

        print(current_time + ' - ' + ' Nothing to Migrate')
            
    time.sleep(300)
