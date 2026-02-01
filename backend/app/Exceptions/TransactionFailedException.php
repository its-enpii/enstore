<?php

namespace App\Exceptions;

use Exception;

class TransactionFailedException extends Exception
{
  protected $message = 'Transaction failed';
  protected $code = 400;
}
