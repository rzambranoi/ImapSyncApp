<template>
<section>
        <h1>Singup</h1>
        <div class="alert alert-danger" v-if="errorMessage">
            {{errorMessage}}
        </div>
        <form @submit.prevent="login">
            <div class="form-group">
                <label for="username">Username</label>
                <input 
                    v-model="user.username"
                    type="text" 
                    class="form-control"  
                    id="username" 
                    placeholder="Enter a username" 
                    required />
                <small id="usernameHelp" class="from-text text-muted"> 
                    Enter your username to login.
                </small>  
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <div class="inputField">
                    <input
                    v-model="user.password"                        
                    type="password" 
                    class="form-control" 
                    id="password" 
                    placeholder="Password" 
                    required/>
                <button class="InputAddOn-item" id='lookPassword' type="button" @click.prevent="showPassword">🙈</button>
                </div> 
                <small id="passwordHelp" class="from-text text-muted"> 
                    Enter your password to login.
                </small>  
            </div>
            <button type="submit" class="btn btn-primary" id="submit-button">Login</button>
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
const SIGNUP_URL = 'http://localhost:8081/api/v1/login';

const schema = Joi.object().keys({
    username: Joi.string().required().min(5).max(20),
    password: Joi.string().required().min(8).pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])/)),
});


export default{

 data: () => ({
        errorMessage: '',
        user: {
            username: '',
            password: '',
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

        showPassword(){
            if(document.getElementById('password').getAttribute('type') === 'password'){
                document.getElementById('password').setAttribute('type', 'text');
                document.querySelector('#lookPassword').innerHTML = '🐵';
            }else{
                document.getElementById('password').setAttribute('type', 'password');
                document.querySelector('#lookPassword').innerHTML = '🙈';
            }
            
        },
        login(){
            this.errorMessage = '';

            if(this.isValid()){
                const body_user = {
                    username: this.user.username,
                    password: this.user.password,
                }
                document.getElementById("submit-button").style.display = "none";
                document.getElementById("loading-spinner").style.display = "";
                fetch(SIGNUP_URL, {
                    method: 'POST',
                    body: JSON.stringify(body_user),
                    headers: {
                        'content-type': 'application/json'
                    },
                }).then(response => {
                    if(response.ok){
                        return response.json();
                    }else{
                        return response.json().then((error) => {
                            throw new Error(error.error);
                        });
                    }
                }).then((result) =>{
                    localStorage.token = result.token;
                    this.$router.push('/');
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

            if(result.error.details[0].message.includes('username')){
                this.errorMessage = "Username must be between 5 and 20 characters long"
            }

            if(result.error.details[0].message.includes('password')){
                this.errorMessage = "Password Must be at least 8 char long and contain uppercase, lowercase, number and an special char. "
            }

            return false;
        },
    },
}

</script>