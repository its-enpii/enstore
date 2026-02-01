<?php

namespace App\Exceptions;

use Exception;

class ProductUnavailableException extends Exception
{
  protected $message = 'Product is currently unavailable';
  protected $code = 400;
}
