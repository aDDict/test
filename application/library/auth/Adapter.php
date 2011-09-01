<?php

class Adapter implements Zend_Auth_Adapter_Interface {
  
  protected $username;
  protected $password;
  
  public function __construct($arr) {
    $this->username = $arr["username"];
    $this->password = $arr["password"];
  }
  
  public function authenticate() {
    
    $users=array('faheem','123456');
    
    if(in_array($this->username,$users) && !in_array($this->password,$users)) {
      return new Zend_Auth_Result(Zend_Auth_Result::FAILURE_CREDENTIAL_INVALID,$this->password);
    }
    
    if(!in_array($this->username,$users) && in_array($this->password,$users)) {
      return new Zend_Auth_Result(Zend_Auth_Result::FAILURE_IDENTITY_NOT_FOUND,$this->username);
    }
    
    if(!in_array($this->username,$users) && !in_array($this->password,$users)) {
      return new Zend_Auth_Result(Zend_Auth_Result::FAILURE_IDENTITY_NOT_FOUND,"{$this->username},{$this->password}");
    }
    
    return new Zend_Auth_Result(Zend_Auth_Result::SUCCESS);
  }
}
