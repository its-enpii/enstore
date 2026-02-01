<?php

namespace App\Exceptions;

use Exception;

class PaymentFailedException extends Exception
{
  protected $message = 'Payment failed';
  protected $code = 400;
}
