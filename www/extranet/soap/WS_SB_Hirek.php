<?php

include('../auth.php');
include_once('WS_Cli_Snowite.php');

class WS_SB_Hirek {

    private $client_ids = array("2882f539aa7e296c7479d1d2e4715595"=>array("accepted_ips"=>array("213.163.8.231","213.163.8.229","192.168.250.254","93.92.248.121"),
                                                                          "name"=>"superbox.hu",
                                                                          "allowed_actions"=>array("Subscribe","Validate","GetUserData","GetUserDataByMobile","GetUserDataByEmail",
                                                                                                   "ChangeUserName","UpdateUserData","Payment","GetPaymentData","ValidatePayment")),
                                "2e0919d6f12e9ed7221e4a36cd6a0e37"=>array("accepted_ips"=>array("192.168.250.254","93.92.248.121"),
                                                                          "name"=>"maxima.hu",
                                                                          "allowed_actions"=>array("Synchronize","Subscribe","Validate","UpdateUserData")));
    private $errors = array("invalid_client"        =>-11,
                            "invalid_client_ip"     =>-12,
                            "invalid_mobile_number" =>-13,
                            "password_too_short"    =>-14,
                            "mobile_already_exists" =>-15,
                            "username_already_exists"=>-16,
                            "register_unsuccessful" =>-17,
                            "payment_unsuccessful"  =>-18,
                            "invalid_client_action" =>-19,
                            "mobile_does_not_exist" =>-1,
                            "invalid_username"      =>-20,
                            "invalid_validator_code"=>-21,
                            "validation_unsuccessful"=>-22,
                            "update_unsuccessful"   =>-23,
                            "error_getting_data_for_snowite"   =>-30,
                            "snowite_error"   =>-31,
                            "invalid_transaction_id"   =>-40,
                            "payment_validation_unsuccessful"   =>-41
                    ); 
    private $userparams = array();    

    private function GetUserParams() {
        
        $res = mysql_query("select d.variable_name,d.variable_type from demog d,vip_demog vd where d.id=vd.demog_id and vd.group_id=1562");
        while ($k=mysql_fetch_array($res)) {
            $this->userparams["$k[variable_name]"] = $k["variable_type"];
        }
    }

    /** 
     * Synchronizes user data - tries to update, if the user does not exist then subscribes and validates
     * 
     * @param string    $client_id  Client id, used to identify the client
     * @param mixed     $userdata
     * @return string   username on success <0 otherwise
     */  
	public function Synchronize($client_id,$userdata) {

        $this->log("start","synchronize");
        if (($ret = $this->check_client($client_id,"Synchronize"))<0) {
            return $ret;
        }
        $this->log("success");  // end logging here, the functions below will use their own logs
        $result = $this->Subscribe($client_id,$userdata);
        if (in_array($result,array(-15,-16))) {  // userneme or mobile already exists, try to update
	        return $this->UpdateUserData($client_id,$userdata);
        }
        elseif (substr($result,0,1)!="-") {
	        return $this->Validate($client_id,$result);
        }
        else {
            return $result;
        }
    }

    /** 
     * Subscribes new user
     * 
     * @param string    $client_id  Client id, used to identify the client
     * @param mixed     $userdata
     * @return string   Validator code on success <0 otherwise
     */  
	public function Subscribe($client_id,$userdata) {

        $this->log("start","subscribe");
        if (($ret = $this->check_client($client_id,"Subscribe"))<0) {
            return $ret;
        }
        $phone = $this->check_mobile("+36$userdata[mobilkorzet]$userdata[mobilszam]",0);
        if (!empty($phone["error"])) {
            return $this->error($phone["error"]);
        }
        $res = mysql_query("select id from users_superbox where ui_felhasznalo='" . mysql_escape_string($userdata["felhasznalo"]) . "'");
        if ($res && mysql_num_rows($res)) {
            return $this->error("username_already_exists");
        }
        if (mb_strlen($userdata["jelszo"],"UTF-8")<8) {
            return $this->error("password_too_short");
        }
        $validator_code = md5(rand() . serialize($userdata));
        $sql="insert into users_superbox set validated='no',robinson='no',bounced='no',tstamp=now(),data_changed=now(),date=now(),validator_code='$validator_code'";
        $this->GetUserParams();
        foreach ($this->userparams as $param=>$type) {
            if ($type=="enum") {
                $data = "," . preg_replace("/[^0-9]/","",$userdata["$param"]) . ",";
            }
            else {
                $data = mysql_escape_string($userdata["$param"]);
            }
            $sql .= ",ui_$param='$data'";
        }
        if ($res=mysql_query($sql)) {
            $this->log("success");
            return $validator_code;
        }
        else {
            return $this->error("register_unsuccessful");
        }
	}

    /** 
     * Validates user
     * 
     * @param string    $client_id  Client id, used to identify the client
     * @param string    $validator_code String returned by Subscribe()
     * @return string   username if the validation was successful, <0 otherwise
     */  
	public function Validate($client_id,$validator_code) {

        $this->log("start","validate");
        if (($ret = $this->check_client($client_id,"Validate"))<0) {
            return $ret;
        }
        if (strlen($validator_code)<16) {
            return $this->error("invalid_validator_code");
        }
        $validator_code=mysql_escape_string($validator_code);
        $sql = "select id,ui_felhasznalo from users_superbox where validator_code='$validator_code'";
        $res = mysql_query($sql);
        if ($res && mysql_num_rows($res)) {
            $k=mysql_fetch_array($res);
            $sql = "set validated='yes',validated_date=now() where ui_felhasznalo='" . mysql_escape_string($k["ui_felhasznalo"]) . "'";
            if (($ret = $this->update_user_data($k["id"],$sql,"validation_unsuccessful"))<0) {
                return $ret;
            }
            $this->log("success");
            return $k["ui_felhasznalo"];
        }
        else {
            return $this->error("invalid_validator_code");
        }
    }

    /** 
     * Updates $username's user data - if a parameter is empty it's not updated
     * 
     * @param string    $client_id  Client id, used to identify the client
     * @param mixed     $userdata
     * @return int      1 on success <0 otherwise
     */  
	public function UpdateUserData($client_id,$userdata) {

        $this->log("start","updateuserdata");
        if (($ret = $this->check_client($client_id,"UpdateUserData"))<0) {
            return $ret;
        }
        $username=mysql_escape_string($userdata["felhasznalo"]);
        if (!empty($mobile)) {
            $phone = $this->check_mobile("+36$userdata[mobilkorzet]$userdata[mobilszam]",0,$username);
            if (!empty($phone["error"])) {
                return $this->error($phone["error"]);
            }
        }
        $sql = "select id from users_superbox where ui_felhasznalo='$username'";
        $res = mysql_query($sql);
        if ($res && mysql_num_rows($res)) {
            $k = mysql_fetch_array($res);
            $sql = "set tstamp=now(),data_changed=now()";
            $this->GetUserParams();
            foreach ($this->userparams as $param=>$type) {
                if (isset($userdata["$param"])) {
                    if ($type=="enum") {
                        $data = "," . preg_replace("/[^0-9]/","",$userdata["$param"]) . ",";
                    }
                    else {
                        $data = mysql_escape_string($userdata["$param"]);
                    }
                    if ($param!="felhasznalo") {
                        $sql .= ",ui_$param='$data'";
                    }
                }
            }
            if (($ret=$this->update_user_data($k["id"],"$sql where id='$k[id]'","update_unsuccessful"))<0) {
                return $ret;
            }
            $this->log("success");
            return 1;
        }
        else {
            return $this->error("invalid_username");
        }
	}

    /** 
     * Changes username
     * 
     * @param string    $client_id  Client id, used to identify the client
     * @param string    $username 
     * @param string    $new_username 
     * @return int      1 on success <0 otherwise
     */  
	public function ChangeUserName($client_id,$username,$new_username) {

        $this->log("start","changeusername");
        if (($ret = $this->check_client($client_id,"ChangeUserName"))<0) {
            return $ret;
        }
        $username=mysql_escape_string($username);
        $new_username=mysql_escape_string($new_username);
        $sql = "select id from users_superbox where ui_felhasznalo='$username'";
        $res = mysql_query($sql);
        if ($res && mysql_num_rows($res)) {
            $sql = "select * from users_superbox where ui_felhasznalo='$new_username'";
            $resn = mysql_query($sql);
            if ($resn && mysql_num_rows($resn)) {
                return $this->error("username_already_exists");
            }
            else {
                $user_id = mysql_result($res,0,0);
                if (($ret=$this->update_user_data($user_id,"set ui_felhasznalo='$new_username' where id=$user_id","update_unsuccessful"))<0) {
                    return $ret;
                }
                $this->log("success");
                return 1;
            }
        }
        else {
            return $this->error("invalid_username");
        }
    }

    /** 
     * Gets user data
     * 
     * @param string    $client_id  Client id, used to identify the client
     * @param string    $username 
     * @return mixed    associative array of user data if the user exists (validated or not), <0 otherwise
     */  
	public function GetUserData($client_id,$username) {

        $this->log("start","getuserdata");
        if (($ret = $this->check_client($client_id,"GetUserData"))<0) {
            return $ret;
        }
        $username=mysql_escape_string($username);
        $sql = "select * from users_superbox where ui_felhasznalo='$username'";
        $res = mysql_query($sql);
        if ($res && mysql_num_rows($res)) {
            $this->log("success");
            return mysql_fetch_array($res);
        }
        else {
            return $this->error("invalid_username");
        }
    }

    /** 
     * Gets user data by 
     * 
     * @param string    $client_id  Client id, used to identify the client
     * @param string    $email 
     * @return mixed    array of associative arraya of user data of corresponding users (validated or not), empty array otherwise
     */  
	public function GetUserDataByEmail($client_id,$email) {

        $this->log("start","getuserdatabyemail");
        if (($ret = $this->check_client($client_id,"GetUserDataByEmail"))<0) {
            return $ret;
        }
        $email = mysql_escape_string($email);
        $users = array();
        $sql = "select * from users_superbox where ui_email='$email'";
        $res = mysql_query($sql);
        while ($k = mysql_fetch_array($res)) {
            $users[]= $k;
        }
        $this->log("success");
        return $users;
    }

    /** 
     * Gets user data by mobile number
     * 
     * @param string    $client_id  Client id, used to identify the client
     * @param string    $mobile 
     * @return mixed    associative array of user data if the user exists (validated or not), <0 otherwise
     */  
	public function GetUserDataByMobile($client_id,$mobile) {

        $this->log("start","getuserdatabymobile");
        if (($ret = $this->check_client($client_id,"GetUserDataByMobile"))<0) {
            return $ret;
        }
        $phone = $this->check_mobile($mobile,1);
        if (!empty($phone["error"])) {
            return $this->error($phone["error"]);
        }
        $sql = "select * from users_superbox where ui_mobilkorzet='$phone[mobilkorzet]' and ui_mobilszam='$phone[mobilszam]'";
        $res = mysql_query($sql);
        if ($res && mysql_num_rows($res)) {
            $this->log("success");
            return mysql_fetch_array($res);
        }
        else {
            return $this->error("mobile_does_not_exist");
        }
    }

    /** 
     * Gets payment data
     * 
     * @param string    $client_id  Client id, used to identify the client
     * @param string    $username 
     * @param string    $payment_type        Payment type filter, if 'all' then not filtered
     * @param string    $payment_validated   Validated filter, 0,1, or 'all' then not filtered
     * @return mixed    associative array of payment data if the user exists (validated or not), <0 otherwise
     */  
	public function GetPaymentData($client_id,$username,$payment_type,$validated) {

        $this->log("start","getpaymentdata");
        if (($ret = $this->check_client($client_id,"GetPaymentData"))<0) {
            return $ret;
        }
        $username=mysql_escape_string($username);
        $sql = "select * from users_superbox where ui_felhasznalo='$username'";
        $res = mysql_query($sql);
        if ($res && mysql_num_rows($res)) {
            $k = mysql_fetch_array($res);
            $q = "select dateadd,days,old_lejarat,transaction_id,payment_type,payment_extra,validated from users_superbox_payment where user_id='$k[id]'";
            if ($payment_type !== "all") {
                $q .= " and payment_type = '" . mysql_escape_string($payment_type) . "'";
            }
            if ($validated !== "all") {
                $q .= " and validated = '" . mysql_escape_string($validated) . "'";
            }
            $q .= " order by dateadd";
            $ret = array();
            $res = mysql_query($q);
            while ($k = mysql_fetch_array($res)) {
                $ret[] = $k;
            }
            $this->log("success");
            return $ret;
        }
        else {
            return $this->error("invalid_username");
        }
    }

    /**
     * Called upon a successful payment
     * 
     * @param string    $client_id   Client id, used to identify the client
     * @param string    $mobile      Mobile phone number
     * @param integer   $timestamp   Unix timestamp of the payment   
     * @param integer   $days        Paid period in days   
     * @param string    $transaction_id        Transaction id
     * @param string    $payment_type        Payment type
     * @param string    $payment_extra       Additional payment data   
     * @param integer   $validated       if 0, the payment needs to be validated using the transaction_id   
     * @return integer 1 on success <0 otherwise
     */  
	public function Payment($client_id,$mobile,$timestamp,$days,$transaction_id,$payment_type,$payment_extra,$validated) {

        $this->log("start","payment");
        if (($ret = $this->check_client($client_id,"Payment"))<0) {
            return $ret;
        }
        $phone = $this->check_mobile($mobile,1);
        if (!empty($phone["error"])) {
            return $this->error($phone["error"]);
        }
        $timestamp = mysql_escape_string($timestamp);
        $days = intval($days);
        $user_id = $phone["data"]["id"];
        $lejarat = $phone["data"]["ui_lejarat"];
        $sql = "insert into users_superbox_payment set dateadd=now(),logfile='$this->logfile',timestamp='$timestamp',
                user_id='$user_id',days='$days',old_lejarat='$lejarat',
                transaction_id = '" . mysql_escape_string($transaction_id) . "',
                payment_type = '" . mysql_escape_string($payment_type) . "',
                payment_extra = '" . mysql_escape_string($payment_extra) . "',validated='$validated'";
        if (!$res=mysql_query($sql)) {
            return $this->error("payment_unsuccessful");
        }
        if ($validated) {
            if (($ret = $this->finish_payment($days,$phone["data"]["id"]))<0) {
                return $ret;
            }
        }
        $this->log("success");
        return 1;
	}

    /** 
     * Validates payment
     * 
     * @param string    $client_id  Client id, used to identify the client
     * @param string    $transaction_id
     * @return string   new expiration date on success in yyyy.mm.dd. format, <0 otherwise
     */  

	public function ValidatePayment($client_id,$transaction_id) {

        $this->log("start","validatepayment");
        if (($ret = $this->check_client($client_id,"ValidatePayment"))<0) {
            return $ret;
        }
        $transaction_id=mysql_escape_string($transaction_id);
        $res = mysql_query("select days,user_id from users_superbox_payment where transaction_id='$transaction_id' and validated=0");
        if ($res && mysql_num_rows($res)) {
            $days = mysql_result($res,0,0);
            $user_id = mysql_result($res,0,1);
        }
        else {
            return $this->error("invalid_transaction_id");
        }
        if (!$res = mysql_query("update users_superbox_payment set validated=1 where transaction_id='$transaction_id'")) {
            return $this->error("payment_validation_unsuccessful");
        }
        if (($ret = $this->finish_payment($days,$user_id))<0) {
            return $ret;
        }
        $this->log("success");
        return $ret;
    }

    private function finish_payment($days,$user_id) {

        $sql = "set tstamp=now(),data_changed=now(),ui_banner_csoport='http://ad.hirekmedia.hu/ad.php?adslot=superbox_0',
                ui_lejarat=from_days(to_days(if(ui_lejarat<now(),now(),ui_lejarat))+$days) where id='$user_id'";
        if (($ret = $this->update_user_data($user_id,$sql,"payment_unsuccessful"))<0) {
            return $ret;
        }
        $r = mysql_query("select ui_lejarat from users_superbox where id='$user_id'");
        if ($r && mysql_num_rows($r)) {
            return str_replace("-",".",mysql_result($r,0,0)) . ".";
        }
        else {
            return 1; // cannot return error here, as the payment itself was successful
        }
    }

    private function check_client($client_id,$action) {

        if (strlen($client_id)<16 || !isset($this->client_ids["$client_id"])) {
            return $this->error("invalid_client");
        }
        $cli =& $this->client_ids["$client_id"];
        if (!in_array($action,$cli["allowed_actions"])) {
            return $this->error("invalid_client_action");
        }
        if (!in_array("all",$cli["accepted_ips"]) && !in_array($_SERVER["REMOTE_ADDR"],$cli["accepted_ips"])) {
            return $this->error("invalid_client_ip");
        }
        return 1;
    }

    private function check_mobile($mobile,$should_exist=1,$except_username="") {

        $data = array();
        $mobile = preg_replace("/[^0-9]/","",$mobile);
        if (preg_match("/^(?:36|0036|06)?([237]0)([0-9]{7})$/",$mobile,$regs)) {
            $mobilkorzet=$regs[1];
            $mobilszam=$regs[2];
        }
        elseif (preg_match("/^(?:36|0036|06)?(99)([0-9]{8})$/",$mobile,$regs)) { // test phone numbers...
            $mobilkorzet=$regs[1];
            $mobilszam=$regs[2];
        }
        else {
            return array("error"=>"invalid_mobile_number");
        }
        $res = mysql_query("select id,ui_lejarat,if(to_days(ui_lejarat)-to_days(now())>0,0,1) in_past,validated 
                            from users_superbox where ui_mobilkorzet='$mobilkorzet' and ui_mobilszam='$mobilszam'" . 
                            ($except_username==""?"":" and ui_felhasznalo!='$except_username'"));
        if ($res && $data=mysql_fetch_array($res)) {
            if ($should_exist == 0) {
                return array("error"=>"mobile_already_exists");
            }
            if ($should_exist == 1 && $validated=="no") {
                return array("error"=>"mobile_does_not_exist");
            }
        }
        elseif ($should_exist == 1) {
            return array("error"=>"mobile_does_not_exist");
        }
        return array("mobilkorzet"=>$mobilkorzet,"mobilszam"=>$mobilszam,"data"=>$data);
    }

    private function error($name,$additional="") {

        $ret = $this->errors["$name"];
        $this->log("error","$ret - $name $additional");
        return $ret; 
    }

    private function log($event,$param="") {

        if ($event=="start") {
            $this->logtype = $param;
        }
        if (in_array($this->logtype,array("getuserdata","getuserdatabyemail","getuserdatabymobile"))) {  // not logged at all
            return;
        }
        if ($event=="start") {
            $this->logfile = "/var/spool/subscribe/soap/server/$param/" . time() . "-" . mt_rand(10000,99999);
            $this->logtype = $param;
            if ($fp = fopen("$this->logfile.notok","w")) {
                fwrite($fp,@file_get_contents('php://input'));
                fwrite($fp,"\n$_SERVER[REMOTE_ADDR]\n");
                fclose($fp);
            }
        }
        elseif ($event=="success") {
            if (in_array($this->logtype,array("subscribe","updateuserdata","validate","payment","validatepayment","synchronize"))) { // log file remains even if successful
                rename("$this->logfile.notok","$this->logfile.ok");
            }
            else {
                unlink("$this->logfile.notok");
            }
        }
        else {
            if ($fp = fopen("$this->logfile.notok","a")) {
                fwrite($fp,"$event: $param\n");
                fclose($fp);
            }
        }
    }

    // this function updates users_superbox table and synces data with superbox.
    // as we don't have innodb tables it simulates transactions using locks and temporary tables
    private function update_user_data($user_id,$sql,$errcode) {

        mysql_query("lock tables users_superbox write");
        if (!$res = mysql_query("create temporary table users_superbox_temp engine=memory select * from users_superbox where id=$user_id")) {
            return $this->update_user_data_error($this->error($errcode),$sql,1,$user_id);
        }
        if (!$res = mysql_query("update users_superbox_temp $sql")) {
            return $this->update_user_data_error($this->error($errcode),$sql,2,$user_id);
        }
        if (($ret = $this->sync_snowite($user_id,"users_superbox_temp"))<0) {
            return $this->update_user_data_error($ret,$sql,3,$user_id);
        }
        if (!$res = mysql_query("update users_superbox $sql")) {
            return $this->update_user_data_error($this->error($errcode),$sql,4,$user_id);
        }
        mysql_query("unlock tables");
        return 1;
    }

    private function update_user_data_error($errcode,$sql,$step,$user_id) {

        mysql_query("unlock tables");
        mysql_query("insert into users_superbox_update_error (date,errcode,sql_query,step,user_id) values (now(),'$errcode','" . mysql_escape_string($sql) . "','$step','$user_id')");
        // sync with snowite using new data was successful but then we could not update users_superbox; try to resync with old data
        if ($step == 4) {
            return $this->sync_snowite($user_id,"users_superbox");
        }
        return $errcode;
    }

    private function sync_snowite($user_id,$base_table="users_superbox") {

        $res = mysql_query("select id as userid,
                                   ui_vezeteknev as last_name,
                                   ui_keresztnev as first_name,
                                   ui_email as email,
                                   ui_felhasznalo as login,
                                   ui_lejarat as expirationdate,
                                   ui_banner_csoport as groupid,
                                   ui_jelszo as password,
                                   if (ui_lejarat<now(),'Trial','Free') subscription
                                   from $base_table where id='$user_id'");
        if (!$user = mysql_fetch_array($res)) {
            return $this->error("error_getting_data_for_snowite");
        }
        $this->log("snowite_call",serialize($user));
        $snowite = new WS_Cli_Snowite($this->logfile);
        $result = $snowite->getDetails($user_id);
        if ($result==="0") {
            $result = $snowite->addUser($user);
            //$result = $snowite->updateUser($user);
        }
        else {
            $result = $snowite->updateUser($user);
        }
        if ($result!='"ok"') {
            return $this->error("snowite_error",$result);
        }
        return 1;
    }
}
?>
