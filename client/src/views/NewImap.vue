<template>
  <section>
        <h1>SYNC YOUR EMAIL</h1>
        <div class="alert alert-danger" v-if="errorMessage">
            {{errorMessage}}
        </div>
        <form @submit.prevent="send">
            <div class="form-group">
                <label for="email">Email</label>
                <input 
                    v-model="migration.email"
                    type="text" 
                    class="form-control"  
                    id="email" 
                    placeholder="Enter email" 
                    required />
                <small id="emailHelp" class="from-text text-muted"> 
                    Enter email account you want to sync
                </small>  
            </div>
            
            <div class="form-group">
                <label for="IP_origin">Origin IP</label>
                <input 
                    v-model="migration.origin_IP"
                    type="text" 
                    class="form-control"  
                    id="origin_ip" 
                    placeholder="Enter origin IP"
                    pattern="^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$" 
                    required />
                <small id="IP_originHelp" class="from-text text-muted"> 
                    Enter origin IMAP IP
                </small>  
            </div>

            <div class="form-group">
                <label for="IP_destination">Destination IP</label>
                <input 
                    v-model="migration.destination_IP"
                    type="text" 
                    class="form-control"  
                    id="destination_ip" 
                    placeholder="Enter destination IP" 
                    pattern="^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$"
                    required />
                <small id="IP_destinationHelp" class="from-text text-muted"> 
                    Enter destination IMAP IP
                </small>  
            </div>

            <div class="form-group">
                <label for="Origin_passsword">Origin Password</label>
                <div class="inputField">
                    <input 
                    v-model="migration.origin_password"
                    type="password" 
                    class="form-control"  
                    id="origin_passsword" 
                    placeholder="Enter origin password" 
                    required />
                    <button 
                    class="InputAddOn-item" 
                    id='lookPassword_origin' 
                    type="button" 
                    @click.prevent="showPassword('origin_passsword', '#lookPassword_origin')">🙈</button>
                </div>
                
                <small id="Origin_passswordHelp" class="from-text text-muted"> 
                    Enter the email password of the origin server
                </small>  
            </div>

            <div class="form-group">
                <label for="Destination_passsword">Destination Password</label>
                <div class="inputField">
                    <input 
                    v-model="migration.destination_password"
                    type="password" 
                    class="form-control"  
                    id="destination_passsword" 
                    placeholder="Enter destination password" 
                    required />
                    <button 
                    class="InputAddOn-item" 
                    id='lookPassword_destination' 
                    type="button" 
                    @click.prevent="showPassword('destination_passsword', '#lookPassword_destination' )">
                    🙈
                    </button>
                
                </div>
                <small id="Destination_passswordHelp" class="from-text text-muted"> 
                    Enter the email password of the destination server
                </small>  
            </div>

            <button type="submit" class="btn btn-primary" id="submit-button">Sync!</button>
            <div id="loading-spinner" style="display:none">
                <div class="spinner-border" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
            </div>
        </form>
    </section>
</template>

<script>

import Joi from '@hapi/joi';
const SIGNUP_URL = 'http://localhost:8081/api/v1/basic_imap';

const schema = Joi.object().keys({
    email: Joi.string().required().email({ tlds: { allow: false } }),
    origin_IP: Joi.string().required().pattern(new RegExp(/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/)),
    destination_IP: Joi.string().required().pattern(new RegExp(/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/)),
    origin_password: Joi.string().required().trim().min(1),
    destination_password: Joi.string().required().trim().min(1),
});


export default{

 data: () => ({
        errorMessage: '',
        migration: {
            email: '',
            origin_IP: '',
            destination_IP: '',
            origin_password: '',
            destination_password: '',
        }
    }),
    watch:{
        user:{
            handler(){
                this.errorMessage = '';
            },
            deep: true,
        },
    },
    methods:{

        send(){
            if(this.isValid){
                document.getElementById("submit-button").style.display = "none";
                document.getElementById("loading-spinner").style.display = "";
                fetch(SIGNUP_URL, {
                    method: 'POST',
                    body: JSON.stringify(this.migration),
                    headers: {
                        'content-type': 'application/json',
                        Authorization: `Bearer ${localStorage.token}`,
                    },
                }).then(response => {
                    if(response.ok){
                        return response.json();
                    }else{
                        return response.json().then((Err) => {
                            console.error(Err.error)
                            throw new Error(Err.error);
                        });
                    }
                }).then((result) =>{
                    this.$router.push('/history');
                    alert("Your Migration Is on Queue");
                }).catch((error)=>{
                    document.getElementById("submit-button").style.display = "";
                    document.getElementById("loading-spinner").style.display = "none";
                    this.errorMessage = error;
                });
            }
        },
        isValid(){
            const result = schema.validate(this.user);
            if(!result.error){
                return true;
            }

            switch(result.error.details[0].message){
                case "email":
                    this.errorMessage = "Email must be a valid email";
                    break;
                case "origin_IP":
                    this.errorMessage = "Origin IP must be a valid IP";
                    break;
                case "destination_IP":
                    this.errorMessage = "Destination IP must be a valid IP";
                    break;
                case "origin_password":
                    this.errorMessage = "Origin Password must be a valid Password";
                    break;
                case "destination_password":
                    this.errorMessage = "Destination Password must be a valid Password";
                    break;
            }

            return false;
        },

        showPassword(id_input, id_button){
            if(document.getElementById(id_input).getAttribute('type') === 'password'){
                document.getElementById(id_input).setAttribute('type', 'text');
                document.querySelector(id_button).innerHTML = '🐵';
            }else{
                document.getElementById(id_input).setAttribute('type', 'password');
                document.querySelector(id_button).innerHTML = '🙈';
            }
            
        }
    },
}

</script>