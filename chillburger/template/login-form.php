<section class="container py-5">
    <h2 class="display-4 custom-title text-center mb-3">
        <span class="txt">Accesso e Registrazione</span>
        <span class="emoji">🧑🏼‍💻</span>
    </h2>

    <div class="container d-flex flex-column flex-md-row">
        <div class="container d-flex flex-column align-items-center ">
            <div class="d-flex flex-column align-items-center col-12 col-lg-10">
                <form action="#" method="POST" id="formlogin" name="login" class="d-flex flex-column col-12 col-lg-10">
                    <fieldset class=" p-3 m-3 border border-dark rounded">
                        <legend class="text-center">Login</legend>

                        <label for="loginusername" class="form-label m-1">Username</label>
                        <input type="text" id="loginusername" name="loginusername" class="form-control m-1">

                        <label for="loginpassword" class="form-label m-1">Password</label>
                        <div class="d-flex flex-row">
                            <input type="password" id="loginpassword" name="loginpassword" class="form-control m-1">
                            <button type="button" id="loginshow" class="btn m-1">
                                <span class="fa-solid fa-eye"></>
                            </button>
                        </div>

                        <p id="login-message" class="m-1"></p>

                        <div class="text-center">
                            <input type="submit" value="Login" class="m-2 rounded">
                        </div>
                    </fieldset>
                </form>
            </div>
        </div>
        <div class="container d-flex flex-column align-items-center">
            <div class="d-flex flex-column align-items-center col-12 col-lg-10">
                <form action="#" method="POST" id="formregister" name="register" class="d-flex flex-column col-12 col-lg-10">
                    <fieldset class="p-3 m-3 border border-dark rounded">
                        <legend>Registrazione</legend>

                        <label for="nome" class="form-label m-1 ">Nome</label>
                        <input type="text" id="nome" name="nome" class="form-control m-1">

                        <label for="cognome" class="form-label m-1">Cognome</label>
                        <input type="text" id="cognome" name="cognome" class="form-control m-1">

                        <label for="registerusername" class="form-label m-1">Username</label>
                        <input type="text" id="registerusername" name="registerusername" class="form-control m-1">

                        <label for="registerpassword" class="form-label m-1">Password</label>
                        <div class="d-flex flex-row">
                            <input type="password" id="registerpassword" name="registerpassword" class="form-control m-1">
                            <button type="button" id="registerpasswordshow" class="btn m-1">
                                <span class="fa-solid fa-eye"></span>
                            </button>
                        </div>

                        <label for="confirmpassword" class="form-label m-1">Conferma Password</label>
                        <div class="d-flex flex-row">
                            <input type="password" id="confirmpassword" name="confirmpassword" class="form-control m-1">
                            <button type="button" id="registerconfirmpasswordshow" class="btn m-1">
                                <span class="fa-solid fa-eye"></span>
                            </button>
                        </div>

                        <p id="register-message" class="m-1">La password deve avere una lunghezza di almeno 5 caratteri,contenere un numero e una lettera maiuscola</p>


                        <div class="text-center">
                            <input type="submit" value="Registrati" class="m-2 rounded">
                        </div>

                    </fieldset>
                </form>
            </div>

        </div>
    </div>
</section>