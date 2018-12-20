<?php
    namespace App\Entity;

    use Symfony\Component\Validator\Constraints as Assert;

    class Author
    {
/**
* @Assert\Image(
*     minWidth = 200,
*     maxWidth = 400,
*     minHeight = 200,
*     maxHeight = 400
* )
*/

        /**
         * @Assert\Image(
         *     allowLandscape = false,
         *     allowPortrait = false
         * )
         */

protected $headshot;



    public function setHeadshot(File $file = null)
    {
        $this->headshot = $file;
    }

    public function getHeadshot()
    {
        return $this->headshot;
    }
    }