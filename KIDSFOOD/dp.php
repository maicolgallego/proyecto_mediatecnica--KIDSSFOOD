<?php

session_start();
$conn =mysqli_connect(
    'localhost'
    'root'
    '',
    'usuario'
)or die(mysqli_erro($mysqli));
if(isset($conn)){
    echo 'Base de datos conectada';
}
?>